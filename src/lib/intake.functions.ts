/**
 * Stub server fn for AI intake. Real AI processing lives on the Render backend
 * (see TAKATAK_AUTOMATION_BACKEND_CONTRACT.md). This stub forwards the intake
 * to /ai/intake/start when the backend implements it; otherwise returns a
 * graceful "saved locally" response.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const IntakeInput = z.object({
  serviceKey: z.string().min(1),
  answers: z.record(z.string(), z.unknown()),
  token: z.string().nullish(),
});

export const startAIIntake = createServerFn({ method: "POST" })
  .validator((input) => IntakeInput.parse(input))
  .handler(async ({ data }) => {
    const base = process.env.RENDER_API_BASE_URL?.trim();
    if (!base) return { ok: false, status: 503, message: "TAKATAK AI intake is not configured yet; the request has not been submitted." };
    let endpoint: string;
    try {
      const origin = new URL(base);
      const localDev = process.env.NODE_ENV !== "production" && origin.protocol === "http:" && ["localhost", "127.0.0.1"].includes(origin.hostname);
      if (origin.protocol !== "https:" && !localDev) throw new Error("invalid_api_url");
      endpoint = new URL("/ai/intake/start", origin.origin).toString();
    } catch {
      return { ok: false, status: 503, message: "TAKATAK AI intake is not configured correctly." };
    }
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(data.token ? { Authorization: `Bearer ${data.token}` } : {}),
        },
        body: JSON.stringify({
          serviceKey: data.serviceKey,
          answers: data.answers,
        }),
      });
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          message:
            "AI intake is not available yet. Your request was not submitted.",
        };
      }
      const body = await res.json().catch(() => ({}));
      return { ok: true, status: 200, data: body };
    } catch {
      return {
        ok: false,
        status: 0,
        message:
          "AI intake is not available yet. Your request was not submitted.",
      };
    }
  });