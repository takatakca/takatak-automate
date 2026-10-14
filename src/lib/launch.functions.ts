/**
 * Request a signed portal launch from the TAKATAK backend.
 * An environment-configured public URL is NOT proof of a product entitlement.
 * Never forward the user's bearer token to the legacy backend or bypass a 403.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  serviceKey: z.enum([
    "qmaps", "local_listings", "flexs", "lead_generation", "social_media",
    "voip_phone", "voip", "marketing", "online_marketing",
    "marketplace", "freelancer_marketplace",
  ]),
  token: z.string().nullish(),
});

export const launchExternalService = createServerFn({ method: "POST" })
  .inputValidator((i) => Input.parse(i))
  .handler(async ({ data }) => {
    if (!data.token) return { ok: false as const, message: "Please sign in to launch this service." };
    const raw = process.env.RENDER_API_BASE_URL?.trim();
    if (!raw) return { ok: false as const, message: "TAKATAK service access is not configured yet." };
    let api: URL;
    try {
      api = new URL(raw);
      const localDev = process.env.NODE_ENV !== "production" &&
        api.protocol === "http:" && ["localhost", "127.0.0.1"].includes(api.hostname);
      if (api.protocol !== "https:" && !localDev) throw new Error("unsafe_api_origin");
    } catch {
      return { ok: false as const, message: "TAKATAK service access is not configured correctly." };
    }

    try {
      const res = await fetch(new URL("/integrations/launch", api.origin), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({ serviceKey: data.serviceKey }),
      });
      if (res.status === 401) return { ok: false as const, message: "Please sign in again." };
      if (res.status === 403) return { ok: false as const, message: "This service is not activated for your account." };
      if (!res.ok) return { ok: false as const, message: "This portal is temporarily unavailable." };
      const body = (await res.json().catch(() => ({}))) as { launchUrl?: string };
      if (!body.launchUrl) return { ok: false as const, message: "This portal is not configured yet." };
      // Only backend-issued HTTPS launch URLs; never silently redirect to a
      // plain base URL without checking the user's entitlement.
      const target = new URL(body.launchUrl);
      if (target.protocol !== "https:") return { ok: false as const, message: "The portal URL is invalid." };
      return { ok: true as const, launchUrl: target.href };
    } catch {
      return { ok: false as const, message: "The TAKATAK service is temporarily unavailable." };
    }
  });
