import crypto from "node:crypto";
import { env } from "./env.js";

/** HMAC-signed, short-lived launch URL. */
export function signLaunchUrl(baseUrl: string, userId: string, serviceKey: string): string {
  const exp = Math.floor(Date.now() / 1000) + env.PORTAL_LAUNCH_TTL_SECONDS;
  const payload = `${userId}.${serviceKey}.${exp}`;
  const sig = crypto.createHmac("sha256", env.PORTAL_SIGNING_SECRET).update(payload).digest("hex");
  const url = new URL(baseUrl);
  url.searchParams.set("u", userId);
  url.searchParams.set("s", serviceKey);
  url.searchParams.set("e", String(exp));
  url.searchParams.set("sig", sig);
  return url.toString();
}

/** Constant-time HMAC verification for webhooks. */
export function verifyHmac(secret: string, body: string, signatureHex: string | null): boolean {
  if (!signatureHex) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signatureHex, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
