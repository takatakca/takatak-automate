/**
 * Production env validation. Hard-fails in production for missing critical
 * settings; warns on optional integrations. Imported by server.ts at boot.
 */
import { env } from "../lib/env.js";

type Issue = { level: "error" | "warn"; msg: string };

export function validateEnv(): { errors: string[]; warnings: string[] } {
  const issues: Issue[] = [];
  const isProd = env.NODE_ENV === "production";

  // Legacy MongoDB detection — never allowed.
  if (process.env.MONGO_URI) {
    issues.push({
      level: "error",
      msg: "MONGO_URI is set — this Prisma/Postgres backend does not use MongoDB. Unset it or you are deploying the wrong service.",
    });
  }

  if (!env.DATABASE_URL) {
    issues.push({ level: "error", msg: "DATABASE_URL is required" });
  }

  // Auth: RS256 keypair OR a strong HS256 secret.
  const hasRs256 = Boolean(env.AUTH_PRIVATE_KEY && env.AUTH_PUBLIC_KEY);
  const hasHs256 = Boolean(env.AUTH_JWT_SECRET && env.AUTH_JWT_SECRET.length >= 32);
  if (isProd && !hasRs256 && !hasHs256) {
    issues.push({
      level: "error",
      msg: "Auth keys missing: set AUTH_PRIVATE_KEY + AUTH_PUBLIC_KEY (preferred) or AUTH_JWT_SECRET (>=32 chars).",
    });
  }
  if (isProd && !env.AUTH_ISSUER) {
    issues.push({ level: "error", msg: "AUTH_ISSUER is required in production" });
  }
  if (isProd && !env.CORS_ORIGINS) {
    issues.push({ level: "error", msg: "CORS_ORIGINS is required in production" });
  }
  if (isProd && !env.COOKIE_DOMAIN) {
    issues.push({
      level: "warn",
      msg: "COOKIE_DOMAIN not set — refresh cookies will be host-only.",
    });
  }

  // OTP delivery
  if (!env.SENDGRID_API_KEY || !env.SENDER_EMAIL) {
    issues.push({ level: "warn", msg: "Email OTP disabled (SENDGRID_API_KEY / SENDER_EMAIL missing)" });
  }
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_VERIFY_SERVICE_SID) {
    issues.push({ level: "warn", msg: "Phone OTP disabled (TWILIO_* missing)" });
  }

  // Upmind
  if (!env.UPMIND_API_KEY || !env.UPMIND_BRAND_ID) {
    issues.push({ level: "warn", msg: "Upmind disabled — dashboard will show upmindStatus=not_configured" });
  }

  // Payments
  if (env.PAYMENT_PROVIDER === "stripe" && (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET)) {
    issues.push({ level: "warn", msg: "Stripe payments enabled but STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET missing" });
  }
  if (env.PAYOUT_PROVIDER === "none") {
    issues.push({ level: "warn", msg: "Payout provider disabled (PAYOUT_PROVIDER=none)" });
  }
  if (env.STRIPE_CONNECT_ENABLED && !env.STRIPE_CONNECT_CLIENT_ID) {
    issues.push({ level: "warn", msg: "Stripe Connect enabled but STRIPE_CONNECT_CLIENT_ID missing" });
  }

  const errors = issues.filter((i) => i.level === "error").map((i) => i.msg);
  const warnings = issues.filter((i) => i.level === "warn").map((i) => i.msg);
  return { errors, warnings };
}

/** Call from boot. Throws in production if any errors exist. */
export function assertEnvOrExit(): void {
  const { errors, warnings } = validateEnv();
  for (const w of warnings) console.warn(`[env] WARN: ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`[env] ERROR: ${e}`);
    if (env.NODE_ENV === "production") {
      console.error("[env] Refusing to boot in production with env errors.");
      process.exit(1);
    } else {
      console.warn("[env] Continuing in non-production despite errors.");
    }
  }
}