/**
 * Resolve a launch URL for an external TAKATAK service portal.
 *
 * Production: backend should issue a signed, single-use URL at
 * POST /integrations/launch. Until that endpoint exists, the server returns
 * a public env fallback (configured per portal in process.env).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  serviceKey: z.string().min(1),
  token: z.string().nullish(),
});

const FALLBACK_ENV: Record<string, string> = {
  social_media: "SOCIAL_PORTAL_URL",
  voip_phone: "VOIP_PORTAL_URL",
  lead_generation: "LEADS_PORTAL_URL",
  local_listings: "LOCAL_LISTINGS_PORTAL_URL",
  online_marketing: "MARKETING_PORTAL_URL",
  freelancer_marketplace: "MARKETPLACE_PORTAL_URL",
};

export const launchExternalService = createServerFn({ method: "POST" })
  .inputValidator((i) => Input.parse(i))
  .handler(async ({ data }) => {
    const base =
      process.env.RENDER_API_BASE_URL ?? "https://takatak.onrender.com";
    try {
      const res = await fetch(`${base}/integrations/launch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(data.token ? { Authorization: `Bearer ${data.token}` } : {}),
        },
        body: JSON.stringify({ serviceKey: data.serviceKey }),
      });
      if (res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          launchUrl?: string;
        };
        if (body.launchUrl) return { ok: true, launchUrl: body.launchUrl };
      }
    } catch {
      /* fall through to env fallback */
    }
    const envKey = FALLBACK_ENV[data.serviceKey];
    const fallback = envKey ? process.env[envKey] : undefined;
    if (fallback) return { ok: true, launchUrl: fallback };
    return {
      ok: false,
      message:
        "This TAKATAK service portal is not configured yet. Contact support.",
    };
  });