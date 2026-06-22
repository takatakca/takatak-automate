/**
 * OTP helpers — generate, store hash, verify, send.
 *
 * Channels:
 *   email  -> existing sendEmail() abstraction (Resend / disabled),
 *             with optional SendGrid path when SENDGRID_API_KEY is set.
 *   phone  -> Twilio Verify when TWILIO_* env is set, otherwise treated
 *             as "channel_unavailable" and the caller falls back to email.
 *
 * NEVER log the OTP code. NEVER return the code in API responses.
 */
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../lib/env.js";
import { sendEmail } from "./email.js";

export function generateOtp(): string {
  // 6 digits, zero-padded, uniform.
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtpHash(otp: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(otp, hash);
}

export function otpExpiry(): Date {
  return new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);
}

export interface SendOtpResult {
  ok: boolean;
  channel: "email" | "phone";
  provider: string;
  reason?: string;
}

export async function sendEmailOtp(to: string, otp: string): Promise<SendOtpResult> {
  // Prefer SendGrid when configured (matches legacy contract); fall back to sendEmail().
  if (env.SENDGRID_API_KEY && env.SENDER_EMAIL) {
    try {
      const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.SENDGRID_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: env.SENDER_EMAIL, name: "Takatak Team" },
          subject: "OTP from Takatak Platform",
          content: [
            {
              type: "text/plain",
              value:
                `Your OTP is: ${otp}. It will expire in ${env.OTP_TTL_MINUTES} minutes.\n\n` +
                `Don't share this code with anyone.\nOur employees will never ask for this code.`,
            },
          ],
        }),
      });
      if (resp.ok) return { ok: true, channel: "email", provider: "sendgrid" };
      return { ok: false, channel: "email", provider: "sendgrid", reason: `sendgrid_${resp.status}` };
    } catch {
      return { ok: false, channel: "email", provider: "sendgrid", reason: "exception" };
    }
  }
  const r = await sendEmail({
    to,
    subject: "Your TAKATAK verification code",
    text:
      `Your verification code is: ${otp}\n\nIt expires in ${env.OTP_TTL_MINUTES} minutes. ` +
      `Don't share this code with anyone.`,
    template: "otp",
  });
  return { ok: r.ok, channel: "email", provider: r.provider, reason: r.reason };
}

/** Twilio Verify — start verification. Returns false when not configured. */
export async function sendPhoneOtp(phoneE164: string): Promise<SendOtpResult> {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_VERIFY_SERVICE_SID) {
    return { ok: false, channel: "phone", provider: "twilio", reason: "twilio_not_configured" };
  }
  const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const body = new URLSearchParams({ To: phoneE164, Channel: "sms" });
  try {
    const resp = await fetch(
      `https://verify.twilio.com/v2/Services/${env.TWILIO_VERIFY_SERVICE_SID}/Verifications`,
      { method: "POST", headers: { authorization: `Basic ${auth}`, "content-type": "application/x-www-form-urlencoded" }, body },
    );
    if (resp.ok) return { ok: true, channel: "phone", provider: "twilio" };
    return { ok: false, channel: "phone", provider: "twilio", reason: `twilio_${resp.status}` };
  } catch {
    return { ok: false, channel: "phone", provider: "twilio", reason: "exception" };
  }
}

/** Twilio Verify — check a code. */
export async function checkPhoneOtp(phoneE164: string, code: string): Promise<{ valid: boolean; reason?: string }> {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_VERIFY_SERVICE_SID) {
    return { valid: false, reason: "twilio_not_configured" };
  }
  const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const body = new URLSearchParams({ To: phoneE164, Code: code });
  try {
    const resp = await fetch(
      `https://verify.twilio.com/v2/Services/${env.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
      { method: "POST", headers: { authorization: `Basic ${auth}`, "content-type": "application/x-www-form-urlencoded" }, body },
    );
    if (!resp.ok) return { valid: false, reason: `twilio_${resp.status}` };
    const data = (await resp.json()) as { status?: string; valid?: boolean };
    return { valid: data.status === "approved" || data.valid === true };
  } catch {
    return { valid: false, reason: "exception" };
  }
}

export function normalizePhone(input: string): string {
  // Digits only with leading + if present. (Legacy parity.)
  const trimmed = String(input || "").trim();
  if (trimmed.startsWith("+")) return "+" + trimmed.slice(1).replace(/\D/g, "");
  return trimmed.replace(/\D/g, "");
}