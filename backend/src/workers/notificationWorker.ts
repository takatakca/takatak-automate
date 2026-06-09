/**
 * Notification worker. Scans for operational signals and emits
 * notifications via services/notifications.ts. Dedupes within 24h using
 * metadata.scopeKey. Run as a separate Render worker process:
 *   node dist/workers/notificationWorker.js
 */
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import { notify } from "../services/notifications.js";
import { isConfigured } from "../services/payoutProvider.js";

const INTERVAL = Math.max(env.WORKER_POLL_MS * 2, 60_000);
const ADMIN_USER_ID = process.env.ADMIN_NOTIFICATION_USER_ID ?? "admin";

const olderThan = (h: number) => new Date(Date.now() - h * 3600_000);

async function alreadyNotified(userId: string, type: string, scopeKey: string, withinHours = 24) {
  const since = olderThan(withinHours);
  const existing = await prisma.notification.findFirst({
    where: {
      userId, type, createdAt: { gte: since },
      metadata: { path: ["scopeKey"], equals: scopeKey } as any,
    },
  });
  return Boolean(existing);
}

async function scanUnpaidOrders() {
  const rows = await prisma.order.findMany({
    where: { status: "created", createdAt: { lt: olderThan(24) } }, take: 100,
  });
  for (const o of rows) {
    if (await alreadyNotified(o.userId, "order.paid", `unpaid:${o.id}`)) continue;
    await notify({
      userId: o.userId, type: "order.paid",
      title: "Finish your TAKATAK order",
      message: "Your order is waiting for payment. Complete checkout to start the work.",
      actionUrl: "/dashboard/orders",
      metadata: { scopeKey: `unpaid:${o.id}`, orderId: o.id },
    });
  }
}

async function scanPendingAcceptance() {
  const rows = await prisma.freelancerContract.findMany({
    where: { status: "assigned", createdAt: { lt: olderThan(24) } }, take: 100,
  });
  for (const c of rows) {
    if (await alreadyNotified(c.freelancerId, "project.assigned", `pending:${c.id}`)) continue;
    await notify({
      userId: c.freelancerId, type: "project.assigned",
      title: "Action required: accept your contract",
      message: "TAKATAK assigned you a contract that is still awaiting your acceptance.",
      actionUrl: `/dashboard/freelancer/contracts/${c.id}`,
      metadata: { scopeKey: `pending:${c.id}`, contractId: c.id },
    });
  }
}

async function scanDeliveryReviewReminders() {
  const rows = await prisma.projectDelivery.findMany({
    where: { submittedAt: { lt: olderThan(72) } },
    include: { project: true }, take: 100,
  });
  for (const d of rows) {
    if (d.project.paymentState !== "submitted") continue;
    if (await alreadyNotified(d.project.userId, "delivery.submitted", `review:${d.id}`)) continue;
    await notify({
      userId: d.project.userId, type: "delivery.submitted",
      title: "Please review your delivery",
      message: "Your TAKATAK freelancer submitted a delivery. Review it to release payment or request a revision.",
      actionUrl: `/dashboard/projects/${d.project.id}`,
      metadata: { scopeKey: `review:${d.id}`, projectId: d.project.id },
    });
  }
}

async function scanAdminExceptions() {
  const stuck = await prisma.serviceInstance.findMany({
    where: { state: "waiting_for_takatak", updatedAt: { lt: olderThan(24) } }, take: 50,
  });
  for (const s of stuck) {
    if (await alreadyNotified(ADMIN_USER_ID, "admin.exception", `stuck:${s.id}`)) continue;
    await notify({
      userId: ADMIN_USER_ID, type: "admin.exception",
      title: "Service stuck waiting for TAKATAK",
      message: `Service ${s.id} (${s.serviceKey}) has been waiting > 24h.`,
      actionUrl: "/dashboard/admin/exceptions",
      metadata: { scopeKey: `stuck:${s.id}`, serviceInstanceId: s.id },
    });
  }
  if (!isConfigured()) {
    const ready = await prisma.freelancerContract.findMany({
      where: { paymentState: "released", status: "completed" }, take: 50,
      orderBy: { updatedAt: "desc" },
    });
    for (const c of ready) {
      if (await alreadyNotified(ADMIN_USER_ID, "payout.release_ready", `provider:${c.id}`, 168)) continue;
      await notify({
        userId: ADMIN_USER_ID, type: "payout.release_ready",
        title: "Payout release-ready (provider not configured)",
        message: `Contract ${c.id} is ready for payout but Stripe Connect is not configured. Manual release required.`,
        actionUrl: "/dashboard/admin/payouts",
        metadata: { scopeKey: `provider:${c.id}`, contractId: c.id },
      });
    }
  }
}

async function tick() {
  try {
    await Promise.all([
      scanUnpaidOrders(),
      scanPendingAcceptance(),
      scanDeliveryReviewReminders(),
      scanAdminExceptions(),
    ]);
  } catch (err) {
    console.error("[notificationWorker] error", err);
  }
}

console.log("[notificationWorker] started", { intervalMs: INTERVAL });
void tick();
setInterval(tick, INTERVAL);