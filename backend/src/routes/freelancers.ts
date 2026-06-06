import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const freelancersRouter = Router();

const ApplyBody = z.object({
  displayName: z.string().min(1).max(120),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string().min(1).max(64)).min(1).max(20),
});

freelancersRouter.post("/freelancers/apply", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = ApplyBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const application = await prisma.freelancerApplication.upsert({
    where: { userId: req.userId! },
    update: { ...parsed.data, status: "pending" },
    create: { ...parsed.data, userId: req.userId! },
  });
  res.json({ application: { id: application.id, status: application.status } });
});

freelancersRouter.get("/freelancers/me", requireAuth, async (req: AuthedRequest, res) => {
  const profile = await prisma.freelancerProfile.findUnique({ where: { userId: req.userId! } });
  if (!profile) {
    const app = await prisma.freelancerApplication.findUnique({ where: { userId: req.userId! } });
    return res.json({ profile: app ? { ...app, id: app.id, userId: app.userId } : null });
  }
  res.json({ profile });
});

freelancersRouter.get("/freelancers/contracts", requireAuth, async (req: AuthedRequest, res) => {
  const contracts = await prisma.freelancerContract.findMany({
    where: { freelancerId: req.userId! },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { title: true } } },
    take: 100,
  });
  res.json({
    contracts: contracts.map((c) => ({
      id: c.id,
      projectId: c.projectId,
      projectTitle: c.project.title,
      status: c.status,
      paymentState: c.paymentState,
      amountCents: c.amountCents,
      currency: c.currency,
    })),
  });
});

freelancersRouter.get("/freelancers/contracts/:id", requireAuth, async (req: AuthedRequest, res) => {
  const c = await prisma.freelancerContract.findFirst({
    where: { id: req.params.id, freelancerId: req.userId! },
    include: { project: { select: { title: true } } },
  });
  if (!c) return res.status(404).json({ error: "not_found" });
  res.json({
    contract: {
      id: c.id,
      projectId: c.projectId,
      projectTitle: c.project.title,
      status: c.status,
      paymentState: c.paymentState,
      amountCents: c.amountCents,
      currency: c.currency,
    },
  });
});

freelancersRouter.post("/freelancers/contracts/:id/accept", requireAuth, async (req: AuthedRequest, res) => {
  const c = await prisma.freelancerContract.findFirst({
    where: { id: req.params.id, freelancerId: req.userId! },
  });
  if (!c) return res.status(404).json({ error: "not_found" });
  await prisma.freelancerContract.update({
    where: { id: c.id },
    data: { status: "in_progress", paymentState: "in_progress" },
  });
  await prisma.clientProject.update({
    where: { id: c.projectId },
    data: { paymentState: "in_progress", status: "in_progress" },
  }).catch(() => undefined);
  await prisma.projectAuditLog.create({
    data: { projectId: c.projectId, actor: req.userId!, action: "contract.accepted", data: { contractId: c.id } },
  });
  res.json({ ok: true });
});

freelancersRouter.post("/freelancers/contracts/:id/decline", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({ reason: z.string().max(2000).optional() });
  const parsed = Body.safeParse(req.body ?? {});
  const c = await prisma.freelancerContract.findFirst({
    where: { id: req.params.id, freelancerId: req.userId! },
  });
  if (!c) return res.status(404).json({ error: "not_found" });
  await prisma.freelancerContract.update({
    where: { id: c.id },
    data: { status: "declined" },
  });
  await prisma.clientProject.update({
    where: { id: c.projectId },
    data: { paymentState: "paid_to_takatak" },
  }).catch(() => undefined);
  await prisma.projectAuditLog.create({
    data: { projectId: c.projectId, actor: req.userId!, action: "contract.declined", data: { contractId: c.id, reason: parsed.success ? parsed.data.reason : undefined } },
  });
  res.json({ ok: true });
});

// ---- Freelancer messages (to TAKATAK mediator only — never reaches client directly) ----
freelancersRouter.post("/freelancers/contracts/:id/messages", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({ body: z.string().min(1).max(5000) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const c = await prisma.freelancerContract.findFirst({ where: { id: req.params.id, freelancerId: req.userId! } });
  if (!c) return res.status(404).json({ error: "not_found" });
  const message = await prisma.projectMessage.create({
    data: { projectId: c.projectId, fromUser: `freelancer:${req.userId!}`, body: parsed.data.body },
  });
  res.json({ message: { id: message.id, from: message.fromUser, body: message.body, at: message.at } });
});

// ---- Freelancer delivery submission ----
freelancersRouter.post("/freelancers/contracts/:id/deliveries", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({ note: z.string().max(5000).optional(), fileUrls: z.array(z.string().url()).max(20).optional() });
  const parsed = Body.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const c = await prisma.freelancerContract.findFirst({ where: { id: req.params.id, freelancerId: req.userId! } });
  if (!c) return res.status(404).json({ error: "not_found" });
  const delivery = await prisma.projectDelivery.create({
    data: { projectId: c.projectId, note: parsed.data.note ?? null },
  });
  await prisma.freelancerContract.update({
    where: { id: c.id },
    data: { status: "submitted", paymentState: "submitted" },
  });
  await prisma.clientProject.update({
    where: { id: c.projectId },
    data: { paymentState: "submitted", status: "submitted" },
  }).catch(() => undefined);
  await prisma.projectAuditLog.create({
    data: {
      projectId: c.projectId, actor: `freelancer:${req.userId!}`, action: "delivery.submitted",
      data: { contractId: c.id, deliveryId: delivery.id, fileCount: parsed.data.fileUrls?.length ?? 0 },
    },
  });
  res.json({ delivery });
});

freelancersRouter.get("/freelancers/payouts", requireAuth, async (req: AuthedRequest, res) => {
  const contracts = await prisma.freelancerContract.findMany({
    where: { freelancerId: req.userId! },
    include: { holds: true, releases: true, disputes: true },
  });
  const payouts = contracts.flatMap((c) => {
    const rows: { id: string; contractId: string; status: string; amountCents: number; currency: string; releasedAt?: Date }[] = [];
    for (const h of c.holds) rows.push({ id: `hold:${h.id}`, contractId: c.id, status: "held", amountCents: h.amountCents, currency: h.currency });
    for (const r of c.releases) rows.push({ id: `rel:${r.id}`, contractId: c.id, status: "released", amountCents: r.amountCents, currency: r.currency, releasedAt: r.releasedAt });
    for (const d of c.disputes) if (d.status === "open" || d.status === "reviewing") rows.push({ id: `dispute:${d.id}`, contractId: c.id, status: "disputed", amountCents: c.amountCents, currency: c.currency });
    return rows;
  });
  res.json({ payouts });
});