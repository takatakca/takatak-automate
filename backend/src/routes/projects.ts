import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { startGracePeriod } from "../services/payouts.js";

export const projectsRouter = Router();

const CreateProject = z.object({
  title: z.string().min(1).max(200),
  brief: z.string().min(1).max(5000),
  category: z.string().min(1).max(64),
  budgetCents: z.number().int().positive().optional(),
});

projectsRouter.get("/marketplace/projects", requireAuth, async (req: AuthedRequest, res) => {
  const projects = await prisma.clientProject.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ projects });
});

projectsRouter.post("/marketplace/projects", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CreateProject.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const project = await prisma.clientProject.create({
    data: { ...parsed.data, userId: req.userId! },
  });
  await prisma.projectAuditLog.create({
    data: { projectId: project.id, actor: req.userId!, action: "project.created" },
  });
  res.json({ project });
});

projectsRouter.get("/marketplace/projects/:id", requireAuth, async (req: AuthedRequest, res) => {
  const project = await prisma.clientProject.findFirst({
    where: {
      userId: req.userId!,
      OR: [
        { id: req.params.id },
        ...(req.params.id === "demo" ? [{ title: { startsWith: "Demo:" } }] : []),
      ],
    },
    include: {
      messages: { orderBy: { at: "asc" } },
      files: { orderBy: { uploadedAt: "asc" } },
      milestones: { orderBy: { position: "asc" } },
      deliveries: { orderBy: { submittedAt: "desc" } },
      contracts: { include: { holds: true, releases: true, disputes: true, assignments: true } },
      audits: { orderBy: { at: "desc" }, take: 100 },
    },
  });
  if (!project) return res.status(404).json({ error: "not_found" });
  res.json({
    project,
    messages: project.messages.map((m) => ({ id: m.id, from: m.fromUser, body: m.body, at: m.at })),
    files: project.files.map((f) => ({ id: f.id, name: f.name, url: f.url, size: f.size, uploadedAt: f.uploadedAt })),
    milestones: project.milestones,
    deliveries: project.deliveries.map((d) => ({ id: d.id, note: d.note ?? undefined, files: [], submittedAt: d.submittedAt })),
  });
});

projectsRouter.post("/marketplace/projects/:id/messages", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({ body: z.string().min(1).max(5000) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const project = await prisma.clientProject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!project) return res.status(404).json({ error: "not_found" });
  const message = await prisma.projectMessage.create({
    data: { projectId: project.id, fromUser: req.userId!, body: parsed.data.body },
  });
  res.json({ message: { id: message.id, from: message.fromUser, body: message.body, at: message.at } });
});

projectsRouter.post("/marketplace/projects/:id/approve", requireAuth, async (req: AuthedRequest, res) => {
  const project = await prisma.clientProject.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: { contracts: true, deliveries: { take: 1 } },
  });
  if (!project) return res.status(404).json({ error: "not_found" });
  // Client approval cannot turn an unpaid, unassigned or undelivered project
  // into a payable contract. A freelancer must submit a real delivery first.
  if (project.paymentState !== "submitted" || !project.deliveries.length ||
      !project.contracts.some((c) => c.paymentState === "submitted" && c.status === "submitted")) {
    return res.status(409).json({ error: "delivery_not_ready", state: project.paymentState });
  }
  await prisma.clientProject.update({
    where: { id: project.id },
    data: { paymentState: "approved" },
  });
  await prisma.freelancerContract.updateMany({
    where: { projectId: project.id },
    data: { paymentState: "approved" },
  });
  await prisma.projectAuditLog.create({
    data: { projectId: project.id, actor: req.userId!, action: "delivery.approved", data: { by: "client" } },
  });
  // Auto-start grace period so payouts can release after the configured window.
  const grace = await startGracePeriod(project.id, req.userId!);
  res.json({ ok: true, grace });
});

projectsRouter.post("/marketplace/projects/:id/request-revision", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({ note: z.string().min(1).max(2000) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const project = await prisma.clientProject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!project) return res.status(404).json({ error: "not_found" });
  if (project.paymentState !== "submitted") {
    return res.status(409).json({ error: "revision_not_allowed", state: project.paymentState });
  }
  await prisma.clientProject.update({
    where: { id: project.id },
    data: { paymentState: "revision_requested" },
  });
  await prisma.projectAuditLog.create({
    data: { projectId: project.id, actor: req.userId!, action: "revision.requested", data: { ...parsed.data, by: "client" } },
  });
  res.json({ ok: true });
});

projectsRouter.post("/marketplace/projects/:id/dispute", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({ reason: z.string().min(1).max(2000) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const project = await prisma.clientProject.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: { contracts: { take: 1 } },
  });
  if (!project) return res.status(404).json({ error: "not_found" });
  if (!["assigned", "accepted_by_freelancer", "in_progress", "submitted", "revision_requested", "approved", "grace_period", "release_ready"].includes(project.paymentState) ||
      !project.contracts.length) {
    return res.status(409).json({ error: "dispute_not_allowed", state: project.paymentState });
  }
  await prisma.clientProject.update({
    where: { id: project.id },
    data: { paymentState: "disputed" },
  });
  if (project.contracts[0]) {
    await prisma.disputeCase.create({
      data: { contractId: project.contracts[0].id, openedBy: req.userId!, reason: parsed.data.reason },
    });
  }
  await prisma.projectAuditLog.create({
    data: { projectId: project.id, actor: req.userId!, action: "dispute.opened", data: { by: "client", reason: parsed.data.reason } },
  });
  res.json({ ok: true });
});

// ---- File upload contract ----
// Fail closed until an actual signed upload/storage integration is connected.
// Never advertise a synthetic URL as a successful upload destination.
projectsRouter.post("/marketplace/projects/:id/files/sign", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({
    name: z.string().min(1).max(255),
    size: z.number().int().positive().max(20 * 1024 * 1024),
    contentType: z.string().min(1).max(255),
  });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const project = await prisma.clientProject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!project) return res.status(404).json({ error: "not_found" });
  // TODO: replace with real signed URL (Cloudflare R2 / S3 / Supabase Storage).
  return res.status(503).json({
    error: "storage_not_configured",
    message: "File storage is not yet configured. No file was uploaded.",
  });
});

// ---- Admin assignment ----
projectsRouter.post("/admin/projects/:id/assign", requireAuth, async (req: AuthedRequest, res) => {
  const roles = (req.claims?.roles as string[] | undefined) ?? [];
  if (!roles.includes("admin")) return res.status(403).json({ error: "forbidden" });
  const Body = z.object({
    freelancerId: z.string().min(1).max(128),
    amountCents: z.number().int().positive(),
    currency: z.string().min(3).max(8).default("CAD"),
    note: z.string().max(2000).optional(),
  });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const project = await prisma.clientProject.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "not_found" });
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
  await prisma.clientProject.update({
    where: { id: project.id },
    data: { paymentState: "assigned" },
  });
  res.json({ contract });
});