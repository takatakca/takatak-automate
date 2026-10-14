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

  // A user-created service request is not an entitlement. Only an active
  // instance approved/provisioned by TAKATAK authorizes a partner portal.
  const aliases: Record<string, string[]> = {
    qmaps: ["qmaps", "local_listings"], local_listings: ["qmaps", "local_listings"],
    flexs: ["flexs", "lead_generation"], lead_generation: ["flexs", "lead_generation"],
    voip: ["voip", "voip_phone"], voip_phone: ["voip", "voip_phone"],
    marketing: ["marketing", "online_marketing"], online_marketing: ["marketing", "online_marketing"],
    marketplace: ["marketplace", "freelancer_marketplace"], freelancer_marketplace: ["marketplace", "freelancer_marketplace"],
    social_media: ["social_media"],
  };
  const entitled = await prisma.serviceInstance.findFirst({
    where: {
      ...(serviceInstanceId ? { id: serviceInstanceId } : {}),
      userId: req.userId!,
      serviceKey: { in: aliases[serviceKey] ?? [serviceKey] },
      state: "active",
    },
    select: { id: true },
  });
  if (!entitled) return res.status(403).json({ error: "service_not_active" });

  const launchUrl = buildLaunchUrl(req.userId!, serviceKey);
  if (!launchUrl) return res.status(404).json({ error: "portal_not_configured" });
  res.json({ launchUrl });
});
