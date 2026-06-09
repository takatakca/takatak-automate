/**
 * Email abstraction.
 *
 * Supported providers:
 *   - "resend" (HTTPS POST to api.resend.com/emails using RESEND_API_KEY)
 *   - "none"   (default; logs the would-be send and returns ok)
 *
 * Never throws on missing provider — keeps notification/worker flows safe.
 *
 * Available templates (template names are informational; current
 * implementation renders a plain-text body the caller supplies):
 *   order_received, payment_received, project_assigned,
 *   delivery_submitted, revision_requested, approval_grace_period,
 *   dispute_opened, payout_release_ready
 */
import { env } from "../lib/env.js";

export interface EmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  template?: string;
}

export async function sendEmail(input: EmailInput): Promise<{ ok: boolean; provider: string; reason?: string }> {
  const provider = env.EMAIL_PROVIDER;
  if (provider === "none" || !env.RESEND_API_KEY || !env.EMAIL_FROM) {
    console.log("[email]", "(disabled)", { to: input.to, subject: input.subject, template: input.template });
    return { ok: true, provider: "none", reason: "email_provider_not_configured" };
  }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      console.warn("[email] resend failed", resp.status, body);
      return { ok: false, provider, reason: `resend_${resp.status}` };
    }
    return { ok: true, provider };
  } catch (err) {
    console.warn("[email] error", err);
    return { ok: false, provider, reason: "exception" };
  }
}