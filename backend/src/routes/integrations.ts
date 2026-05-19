import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { buildLaunchUrl } from "../services/launch.js";

export const integrationsRouter = Router();

const Body = z.object({
  serviceKey: z.enum([
    "qmaps", "local_listings",
    "flexs", "lead_generation",
    "social_media",
    "voip_phone", "voip",
    "marketing", "online_marketing",
    "marketplace", "freelancer_marketplace",
  ]),
  serviceInstanceId: z.string().optional(),
});

integrationsRouter.post("/integrations/launch", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const { serviceKey, serviceInstanceId } = parsed.data;

  // If the caller passes a service instance id, enforce ownership.
  if (serviceInstanceId) {
    const owned = await prisma.serviceInstance.findFirst({
      where: { id: serviceInstanceId, userId: req.userId! },
      select: { id: true },
    });
    if (!owned) return res.status(403).json({ error: "forbidden" });
  }

  const launchUrl = buildLaunchUrl(req.userId!, serviceKey);
  if (!launchUrl) return res.status(404).json({ error: "portal_not_configured" });
  res.json({ launchUrl });
});
