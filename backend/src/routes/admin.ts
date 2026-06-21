import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin, type AuthedRequest } from "../middleware/auth.js";
import { transition } from "../services/stateMachine.js";
import { createHoldForContract, releasePayment, startGracePeriod, sweepReleasable } from "../services/payouts.js";
import { notify } from "../services/notifications.js";
import { isConfigured as payoutProviderConfigured } from "../services/payoutProvider.js";

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

adminRouter.get("/admin/exceptions", async (_req, res) => {
  const [pendingServices, failedJobs, intakeReview] = await Promise.all([
    prisma.serviceInstance.findMany({
      where: { state: { in: ["failed", "waiting_for_takatak"] } },
      orderBy: { updatedAt: "asc" },
      take: 200,
    }),
    prisma.automationJob.findMany({
      where: { status: "failed" },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.aIIntake.findMany({
      where: {
        service: { is: { state: "waiting_for_takatak" } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);
  res.json({
    pendingServices,
    failedJobs,
    intakeReview,
    provisioningFailures: pendingServices.filter((s) => s.state === "failed"),
  });
});

// ============================================================
// Admin: marketplace projects fulfillment
// ============================================================

adminRouter.get("/admin/projects", async (req, res) => {
  const filter = (req.query.filter as string | undefined) ?? "all";
  const where: any = {};
  if (filter === "awaiting_assignment") {
    where.paymentState = "paid_to_takatak";
  } else if (filter === "assigned") {
    where.paymentState = { in: ["assigned", "accepted_by_freelancer", "in_progress"] };
  } else if (filter === "submitted") {
    where.paymentState = "submitted";
  } else if (filter === "grace_period") {
    where.paymentState = "grace_period";
  } else if (filter === "disputed") {
    where.paymentState = "disputed";
  } else if (filter === "release_ready") {
    where.paymentState = "release_ready";
  }
  const projects = await prisma.clientProject.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { contracts: { take: 1 } },
  });
  res.json({ projects });
});

adminRouter.get("/admin/freelancers/approved", async (_req, res) => {
  const freelancers = await prisma.freelancerProfile.findMany({
    orderBy: { displayName: "asc" },
    take: 100,
  });
  res.json({ freelancers });
});

adminRouter.get("/admin/projects/:id", async (req, res) => {
  const project = await prisma.clientProject.findUnique({
    where: { id: req.params.id },
    include: {
      contracts: { include: { holds: true, releases: true, disputes: true, assignments: true } },
      messages: { orderBy: { at: "asc" } },
      files: { orderBy: { uploadedAt: "asc" } },
      milestones: { orderBy: { position: "asc" } },
      deliveries: { orderBy: { submittedAt: "desc" } },
      audits: { orderBy: { at: "desc" }, take: 100 },
    },
  });
  if (!project) return res.status(404).json({ error: "not_found" });
  res.json({ project });
});

const AssignBody = z.object({
  freelancerId: z.string().min(1).max(128),
  amountCents: z.number().int().positive(),
  currency: z.string().min(3).max(8).default("CAD"),
  note: z.string().max(2000).optional(),
});
adminRouter.post("/admin/projects/:id/assign", async (req: AuthedRequest, res) => {
  const parsed = AssignBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const project = await prisma.clientProject.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "not_found" });
  if (project.paymentState !== "paid_to_takatak" && project.paymentState !== "assigned") {
    return res.status(409).json({ error: "not_paid", state: project.paymentState });
  }
  const contract = await prisma.freelancerContract.create({
    data: {
      projectId: project.id,
      freelancerId: parsed.data.freelancerId,
      amountCents: parsed.data.amountCents,
      currency: parsed.data.currency,
      status: "assigned",
      paymentState: "assigned",
    },
  });
  await prisma.contractAssignment.create({
    data: { contractId: contract.id, assignedBy: req.userId!, note: parsed.data.note },
  });
  await createHoldForContract(contract.id);
  await prisma.clientProject.update({
    where: { id: project.id },
    data: { paymentState: "assigned", status: "assigned" },
  });
  await prisma.projectAuditLog.create({
    data: {
      projectId: project.id, actor: req.userId!, action: "project.assigned",
      data: { contractId: contract.id, freelancerId: parsed.data.freelancerId, amountCents: parsed.data.amountCents },
    },
  });
  await notify({
    userId: parsed.data.freelancerId,
    type: "project.assigned",
    title: "You've been assigned a new contract",
    message: `TAKATAK assigned you to project "${project.title}". Open it to accept or decline.`,
    actionUrl: `/dashboard/freelancer/contracts/${contract.id}`,
    metadata: { contractId: contract.id, projectId: project.id },
  });
  res.json({ contract });
});

adminRouter.post("/admin/projects/:id/request-revision", async (req: AuthedRequest, res) => {
  const Body = z.object({ note: z.string().min(1).max(2000) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const project = await prisma.clientProject.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "not_found" });
  await prisma.clientProject.update({
    where: { id: project.id },
    data: { paymentState: "revision_requested" },
  });
  await prisma.freelancerContract.updateMany({
    where: { projectId: project.id },
    data: { paymentState: "revision_requested", status: "in_progress" },
  });
  await prisma.projectAuditLog.create({
    data: { projectId: project.id, actor: req.userId!, action: "revision.requested", data: { note: parsed.data.note, by: "admin" } },
  });
  res.json({ ok: true });
});

adminRouter.post("/admin/projects/:id/approve-delivery", async (req: AuthedRequest, res) => {
  const project = await prisma.clientProject.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "not_found" });
  await prisma.clientProject.update({
    where: { id: project.id },
    data: { paymentState: "approved" },
  });
  await prisma.freelancerContract.updateMany({
    where: { projectId: project.id },
    data: { paymentState: "approved" },
  });
  await prisma.projectAuditLog.create({
    data: { projectId: project.id, actor: req.userId!, action: "delivery.approved", data: { by: "admin" } },
  });
  res.json({ ok: true });
});

adminRouter.post("/admin/projects/:id/start-grace-period", async (req: AuthedRequest, res) => {
  const r = await startGracePeriod(req.params.id, req.userId!);
  if (!r) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true, ...r });
});

adminRouter.post("/admin/projects/:id/release-payment", async (req: AuthedRequest, res) => {
  const Body = z.object({ force: z.boolean().optional() }).optional();
  const parsed = Body?.safeParse(req.body ?? {}) ?? { success: true, data: {} as { force?: boolean } };
  const force = (parsed as any).data?.force === true;
  const r = await releasePayment(req.params.id, req.userId!, { force });
  res.json(r);
});

adminRouter.post("/admin/projects/:id/dispute", async (req: AuthedRequest, res) => {
  const Body = z.object({ reason: z.string().min(1).max(2000) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const project = await prisma.clientProject.findUnique({
    where: { id: req.params.id },
    include: { contracts: { take: 1 } },
  });
  if (!project) return res.status(404).json({ error: "not_found" });
  await prisma.clientProject.update({ where: { id: project.id }, data: { paymentState: "disputed" } });
  if (project.contracts[0]) {
    await prisma.disputeCase.create({
      data: { contractId: project.contracts[0].id, openedBy: req.userId!, reason: parsed.data.reason },
    });
  }
  await prisma.projectAuditLog.create({
    data: { projectId: project.id, actor: req.userId!, action: "dispute.opened", data: { by: "admin", reason: parsed.data.reason } },
  });
  res.json({ ok: true });
});

adminRouter.post("/admin/payouts/sweep", async (req: AuthedRequest, res) => {
  const out = await sweepReleasable(req.userId ?? "admin");
  res.json({ ok: true, released: out });
});
