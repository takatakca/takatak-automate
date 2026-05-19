import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { transition } from "../services/stateMachine.js";

export const servicesRouter = Router();

const INTAKE_REQUIRED = new Set([
  "websites",
  "mobile_apps",
  "online_marketing",
  "social_media",
  "ai_business_tools",
]);

const EXTERNAL_PORTAL = new Set([
  "local_listings", "qmaps",
  "lead_generation", "flexs",
  "social_media",
  "voip_phone", "voip",
  "marketing", "online_marketing",
  "freelancer_marketplace", "marketplace",
]);

servicesRouter.get("/user/services", requireAuth, async (req: AuthedRequest, res) => {
  const services = await prisma.serviceInstance.findMany({
    where: { userId: req.userId! },
    orderBy: { updatedAt: "desc" },
  });
  res.json({ services });
});

const StartBody = z.object({
  serviceKey: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/),
  options: z.record(z.string(), z.unknown()).optional(),
});

servicesRouter.post("/services/start", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = StartBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  const { serviceKey, options } = parsed.data;

  const instance = await prisma.serviceInstance.create({
    data: { userId: req.userId!, serviceKey, meta: (options ?? {}) as object },
  });
  await prisma.automationTimelineEvent.create({
    data: { serviceInstanceId: instance.id, state: "draft", label: "Service requested" },
  });

  let nextAction: "checkout" | "intake" | "dashboard" = "dashboard";
  let intakeRequired = false;
  let checkoutUrl: string | undefined;

  if (INTAKE_REQUIRED.has(serviceKey)) {
    await transition({ serviceInstanceId: instance.id, next: "intake_required", label: "Intake required" });
    nextAction = "intake";
    intakeRequired = true;
  } else if (serviceKey === "domains" || serviceKey === "hosting") {
    await transition({ serviceInstanceId: instance.id, next: "checkout_started", label: "Checkout started" });
    nextAction = "checkout";
    // Upmind owns the checkout URL; frontend already drives the Upmind widget.
  } else if (EXTERNAL_PORTAL.has(serviceKey)) {
    nextAction = "dashboard";
  }

  res.json({
    serviceInstanceId: instance.id,
    status: instance.state,
    nextAction,
    intakeRequired,
    checkoutUrl,
    instance,
  });
});

servicesRouter.get("/services/instances/:id", requireAuth, async (req: AuthedRequest, res) => {
  const instance = await prisma.serviceInstance.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!instance) return res.status(404).json({ error: "not_found" });
  res.json({ instance });
});

servicesRouter.get("/services/instances/:id/timeline", requireAuth, async (req: AuthedRequest, res) => {
  const owned = await prisma.serviceInstance.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    select: { id: true },
  });
  if (!owned) return res.status(404).json({ error: "not_found" });
  const events = await prisma.automationTimelineEvent.findMany({
    where: { serviceInstanceId: owned.id },
    orderBy: { at: "asc" },
  });
  res.json({ events });
});
