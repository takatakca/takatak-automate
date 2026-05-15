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
  .inputValidator((input) => IntakeInput.parse(input))
  .handler(async ({ data }) => {
    const base =
      process.env.RENDER_API_BASE_URL ?? "https://takatak.onrender.com";
    try {
      const res = await fetch(`${base}/ai/intake/start`, {
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
            "AI intake is not available yet. Your answers have been saved locally.",
        };
      }
      const body = await res.json().catch(() => ({}));
      return { ok: true, status: 200, data: body };
    } catch {
      return {
        ok: false,
        status: 0,
        message:
          "AI intake is not available yet. Your answers have been saved locally.",
      };
    }
  });