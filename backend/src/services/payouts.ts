/**
 * Payout release helpers.
 *
 * - createHoldForContract: writes a PayoutHold when a contract gets funded.
 *   `holdUntil` is `now + PAYOUT_GRACE_PERIOD_HOURS` from the moment the
 *   client approves the delivery (caller updates it via `startGracePeriod`).
 * - startGracePeriod: marks the contract/project as `grace_period` and sets
 *   the hold expiry from the grace-period env.
 * - releaseIfEligible: writes a PayoutRelease when the grace period has
 *   elapsed AND there's no open dispute. If no payout provider is
 *   configured the contract/project is marked `release_ready` with a
 *   `release_ready` reference rather than dispatching real money.
 * - sweepReleasable: scans all contracts in `grace_period`, releases the
 *   eligible ones. Invoked by an admin endpoint or scheduled job.
 */
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";

function provider(): "stripe" | "manual" | "none" {
  return (process.env.PAYOUT_PROVIDER as any) ?? env.PAYOUT_PROVIDER ?? "none";
}

export async function createHoldForContract(contractId: string) {
  const c = await prisma.freelancerContract.findUnique({ where: { id: contractId } });
  if (!c) return null;
  const existing = await prisma.payoutHold.findFirst({ where: { contractId } });
  if (existing) return existing;
  const holdUntil = new Date(Date.now() + env.PAYOUT_GRACE_PERIOD_HOURS * 3600_000);
  return prisma.payoutHold.create({
    data: {
      contractId,
      amountCents: c.amountCents,
      currency: c.currency,
      holdUntil,
    },
  });
}

export async function startGracePeriod(projectId: string, actor: string) {
  const project = await prisma.clientProject.findUnique({
    where: { id: projectId },
    include: { contracts: true },
  });
  if (!project) return null;
  const holdUntil = new Date(Date.now() + env.PAYOUT_GRACE_PERIOD_HOURS * 3600_000);
  await prisma.clientProject.update({
    where: { id: projectId },
    data: { paymentState: "grace_period" },
  });
  for (const c of project.contracts) {
    await prisma.freelancerContract.update({
      where: { id: c.id },
      data: { paymentState: "grace_period" },
    });
    const hold = await prisma.payoutHold.findFirst({ where: { contractId: c.id } });
    if (hold) {
      await prisma.payoutHold.update({ where: { id: hold.id }, data: { holdUntil } });
    } else {
      await prisma.payoutHold.create({
        data: { contractId: c.id, amountCents: c.amountCents, currency: c.currency, holdUntil },
      });
    }
  }
  await prisma.projectAuditLog.create({
    data: { projectId, actor, action: "payout.grace_started", data: { holdUntil: holdUntil.toISOString() } },
  });
  return { holdUntil };
}

export async function releasePayment(projectId: string, actor: string, opts: { force?: boolean } = {}) {
  const project = await prisma.clientProject.findUnique({
    where: { id: projectId },
    include: { contracts: { include: { holds: true, disputes: true } } },
  });
  if (!project) return { ok: false, reason: "not_found" as const };
  if (!opts.force && project.paymentState !== "grace_period" && project.paymentState !== "approved") {
    return { ok: false, reason: "not_eligible" as const, state: project.paymentState };
  }
  const now = Date.now();
  const released: { contractId: string; reference: string }[] = [];
  for (const c of project.contracts) {
    if (c.disputes.some((d) => d.status === "open" || d.status === "reviewing")) continue;
    if (!opts.force) {
      const hold = c.holds[0];
      if (hold && hold.holdUntil.getTime() > now) continue;
    }
    const isReleaseReadyOnly = provider() === "none";
    const reference = isReleaseReadyOnly ? `release_ready:${c.id}` : `pending_${provider()}:${c.id}`;
    await prisma.payoutRelease.create({
      data: { contractId: c.id, amountCents: c.amountCents, currency: c.currency, reference },
    });
    await prisma.freelancerContract.update({
      where: { id: c.id },
      data: { paymentState: isReleaseReadyOnly ? "release_ready" : "released", status: "completed" },
    });
    released.push({ contractId: c.id, reference });
  }
  if (released.length > 0) {
    await prisma.clientProject.update({
      where: { id: projectId },
      data: { paymentState: provider() === "none" ? "release_ready" : "released" },
    });
    await prisma.projectAuditLog.create({
      data: { projectId, actor, action: "payout.released", data: { released, provider: provider() } },
    });
  }
  return { ok: true, released, provider: provider() };
}

/** Scan all contracts whose grace period has elapsed and release them. */
export async function sweepReleasable(actor = "scheduler") {
  const candidates = await prisma.clientProject.findMany({
    where: { paymentState: "grace_period" },
    select: { id: true },
    take: 200,
  });
  const out: { projectId: string; released: number }[] = [];
  for (const p of candidates) {
    const r = await releasePayment(p.id, actor);
    if (r.ok && r.released) out.push({ projectId: p.id, released: r.released.length });
  }
  return out;
}