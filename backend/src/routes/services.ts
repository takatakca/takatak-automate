import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { transition } from "../services/stateMachine.js";
import { SERVICE_DEFINITIONS } from "../seed/serviceDefinitions.js";

export const servicesRouter = Router();

// Accept legacy portal aliases, but persist one canonical TAKATAK product key.
const ALIASES: Record<string, string> = {
  qmaps: "local_listings", flexs: "lead_generation", voip: "voip_phone",
  marketing: "online_marketing", marketplace: "freelancer_marketplace",
};
const CANONICAL_KEYS = new Set<string>(SERVICE_DEFINITIONS.map((s) => s.key));

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
  const { options } = parsed.data;
  const serviceKey = ALIASES[parsed.data.serviceKey] ?? parsed.data.serviceKey;
  if (!CANONICAL_KEYS.has(serviceKey)) return res.status(400).json({ error: "unknown_service" });

  const instance = await prisma.serviceInstance.create({
    data: { userId: req.userId!, serviceKey, meta: (options ?? {}) as object },
  });
  await prisma.automationTimelineEvent.create({
    data: { serviceInstanceId: instance.id, state: "draft", label: "Service requested" },
  });

  let currentInstance = instance;
  let nextAction: "checkout" | "intake" | "dashboard" = "dashboard";
  let intakeRequired = false;
  let checkoutUrl: string | undefined;

  if (INTAKE_REQUIRED.has(serviceKey)) {
    currentInstance = await transition({ serviceInstanceId: instance.id, next: "intake_required", label: "Intake required" });
    nextAction = "intake";
    intakeRequired = true;
  } else if (serviceKey === "domains" || serviceKey === "hosting") {
    currentInstance = await transition({ serviceInstanceId: instance.id, next: "checkout_started", label: "Checkout started" });
    nextAction = "checkout";
    // Upmind owns the checkout URL; frontend already drives the Upmind widget.
  } else if (EXTERNAL_PORTAL.has(serviceKey)) {
    nextAction = "dashboard";
  }

  res.json({
    serviceInstanceId: instance.id,
    status: currentInstance.state,
    nextAction,
    intakeRequired,
    checkoutUrl,
    instance: currentInstance,
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
