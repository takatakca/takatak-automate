import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin, type AuthedRequest } from "../middleware/auth.js";
import { transition } from "../services/stateMachine.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/admin/automation/jobs", async (req, res) => {
  const status = (req.query.status as string | undefined);
  const jobs = await prisma.automationJob.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  res.json({ jobs });
});

adminRouter.get("/admin/services/pending", async (_req, res) => {
  const services = await prisma.serviceInstance.findMany({
    where: { state: { in: ["failed", "waiting_for_takatak"] } },
    orderBy: { updatedAt: "asc" },
    take: 200,
  });
  res.json({ services });
});

const Assign = z.object({ assigneeId: z.string().min(1) });
adminRouter.post("/admin/services/:id/assign", async (req: AuthedRequest, res) => {
  const parsed = Assign.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const updated = await prisma.serviceInstance.update({
    where: { id: req.params.id },
    data: { meta: { assigneeId: parsed.data.assigneeId } as any },
  });
  await prisma.automationTimelineEvent.create({
    data: { serviceInstanceId: updated.id, state: updated.state, label: `Assigned to ${parsed.data.assigneeId}`, actor: "takatak" },
  });
  res.json({ instance: updated });
});

adminRouter.post("/admin/services/:id/approve", async (req, res) => {
  const updated = await transition({ serviceInstanceId: req.params.id, next: "active", label: "Approved by TAKATAK", actor: "takatak" });
  res.json({ instance: updated });
});

adminRouter.post("/admin/services/:id/fail", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message : undefined;
  const updated = await transition({ serviceInstanceId: req.params.id, next: "failed", label: "Marked failed", message, actor: "takatak" });
  res.json({ instance: updated });
});
