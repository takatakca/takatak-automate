import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

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
    where: { id: req.params.id, userId: req.userId! },
    include: {
      messages: { orderBy: { at: "asc" } },
      files: { orderBy: { uploadedAt: "asc" } },
      milestones: { orderBy: { position: "asc" } },
      deliveries: { orderBy: { submittedAt: "desc" } },
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
  const project = await prisma.clientProject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!project) return res.status(404).json({ error: "not_found" });
  await prisma.clientProject.update({
    where: { id: project.id },
    data: { paymentState: "approved" },
  });
  await prisma.projectAuditLog.create({
    data: { projectId: project.id, actor: req.userId!, action: "delivery.approved" },
  });
  res.json({ ok: true });
});

projectsRouter.post("/marketplace/projects/:id/request-revision", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({ note: z.string().min(1).max(2000) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const project = await prisma.clientProject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!project) return res.status(404).json({ error: "not_found" });
  await prisma.clientProject.update({
    where: { id: project.id },
    data: { paymentState: "revision_requested" },
  });
  await prisma.projectAuditLog.create({
    data: { projectId: project.id, actor: req.userId!, action: "revision.requested", data: parsed.data },
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
  await prisma.clientProject.update({
    where: { id: project.id },
    data: { paymentState: "disputed" },
  });
  if (project.contracts[0]) {
    await prisma.disputeCase.create({
      data: { contractId: project.contracts[0].id, openedBy: req.userId!, reason: parsed.data.reason },
    });
  }
  res.json({ ok: true });
});

// ---- File upload contract (signed-URL placeholder) ----
// Returns metadata the frontend uses to POST to a real storage provider. Until
// a storage provider is wired, this returns a synthetic URL so the UI flow works.
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
  const placeholderUrl = `https://uploads.takatak.local/${project.id}/${encodeURIComponent(parsed.data.name)}`;
  res.json({ uploadUrl: placeholderUrl, fileUrl: placeholderUrl, provider: "placeholder" });
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