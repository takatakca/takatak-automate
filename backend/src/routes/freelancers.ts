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
    data: { status: "accepted", paymentState: "accepted_by_freelancer" },
  });
  res.json({ ok: true });
});

freelancersRouter.post("/freelancers/contracts/:id/decline", requireAuth, async (req: AuthedRequest, res) => {
  const c = await prisma.freelancerContract.findFirst({
    where: { id: req.params.id, freelancerId: req.userId! },
  });
  if (!c) return res.status(404).json({ error: "not_found" });
  await prisma.freelancerContract.update({
    where: { id: c.id },
    data: { status: "declined" },
  });
  res.json({ ok: true });
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