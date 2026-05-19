import { env } from "../lib/env.js";
import { signLaunchUrl } from "../lib/signing.js";

const MAP: Record<string, string | undefined> = {
  qmaps: env.QMAPS_PORTAL_BASE_URL,
  local_listings: env.QMAPS_PORTAL_BASE_URL,
  flexs: env.FLEXS_PORTAL_BASE_URL,
  lead_generation: env.FLEXS_PORTAL_BASE_URL,
  social_media: env.SOCIAL_PORTAL_BASE_URL,
  voip_phone: env.VOIP_PORTAL_BASE_URL,
  voip: env.VOIP_PORTAL_BASE_URL,
  marketing: env.MARKETING_PORTAL_BASE_URL,
  online_marketing: env.MARKETING_PORTAL_BASE_URL,
  marketplace: env.MARKETPLACE_PORTAL_BASE_URL,
  freelancer_marketplace: env.MARKETPLACE_PORTAL_BASE_URL,
};

export function buildLaunchUrl(userId: string, serviceKey: string): string | null {
  const base = MAP[serviceKey];
  if (!base) return null;
  return signLaunchUrl(base, userId, serviceKey);
}
