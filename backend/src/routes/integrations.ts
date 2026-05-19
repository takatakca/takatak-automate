import { Router } from "express";
import { z } from "zod";
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
});

integrationsRouter.post("/integrations/launch", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const launchUrl = buildLaunchUrl(req.userId!, parsed.data.serviceKey);
  if (!launchUrl) return res.status(404).json({ error: "portal_not_configured" });
  res.json({ launchUrl });
});
