/**
 * Public TAKATAK service intent layer — SHARED CONTRACT.
 *
 * This file defines the ONLY data shape that may cross the boundary between
 * the public TAKATAK sales site (this repo) and the TAKATAK dashboard app
 * (separate Next.js / Supabase / Prisma repo).
 *
 * This repo produces intents. It does NOT create tenant records, workspaces,
 * brands, locations, or ServiceInstances — the dashboard repo owns all of
 * that, behind its own Supabase cookie auth and workspace permission guards.
 *
 * Mirror this file verbatim in the dashboard repo
 * (src/lib/service-intents/service-intent-contract.ts) so both sides validate
 * the same shape.
 */

export type InternalServiceType =
  | "domain"
  | "web_hosting"
  | "social_media"
  | "local_listings"
  | "leads"
  | "ai_studio"
  | "reports"
  | "billing"
  | "support"
  | "custom";

export type BillingType = "one_time" | "monthly" | "yearly" | "per_lead" | "custom";

export interface PublicServiceIntent {
  serviceKey: string;
  publicLabel: string;
  internalServiceType: InternalServiceType;
  planKey?: string;
  packageKey?: string;
  priceCents?: number;
  currency: "CAD";
  billingType?: BillingType;
  query?: string;
  domain?: string;
  language: "en" | "fr";
  sourcePage?: string;
  /** Dashboard-repo path. Must be validated against real routes on receipt. */
  nextDashboardPath: string;
  createdAt: string;
  expiresAt: string;
}

/** Intent lifetime. Anything older is rejected by the receiver. */
export const INTENT_TTL_MS = 6 * 60 * 60 * 1000;

const SERVICE_TYPES: readonly InternalServiceType[] = [
  "domain",
  "web_hosting",
  "social_media",
  "local_listings",
  "leads",
  "ai_studio",
  "reports",
  "billing",
  "support",
  "custom",
];

const BILLING_TYPES: readonly BillingType[] = [
  "one_time",
  "monthly",
  "yearly",
  "per_lead",
  "custom",
];

/**
 * Dashboard paths the public site is allowed to request. The dashboard repo
 * MUST re-validate against its actual App Router routes; anything unknown
 * falls back to /dashboard/start.
 */
export const ALLOWED_DASHBOARD_PATHS = [
  "/dashboard/start",
  "/dashboard/services",
  "/dashboard/web-hosting",
  "/dashboard/social",
  "/dashboard/local-listings",
  "/dashboard/leads",
  "/dashboard/ai-studio",
  "/dashboard/reports",
  "/dashboard/support",
] as const;

export const DEFAULT_DASHBOARD_PATH = "/dashboard/start";

export function isAllowedDashboardPath(path: string): boolean {
  return (ALLOWED_DASHBOARD_PATHS as readonly string[]).includes(path);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export interface IntentValidation {
  ok: boolean;
  intent?: PublicServiceIntent;
  reason?:
    | "malformed"
    | "invalid_service_key"
    | "invalid_service_type"
    | "invalid_currency"
    | "invalid_language"
    | "invalid_billing_type"
    | "invalid_next_path"
    | "expired";
}

/** Pure validator, safe to run on either side of the boundary. */
export function validateServiceIntent(input: unknown, now = Date.now()): IntentValidation {
  if (!input || typeof input !== "object") return { ok: false, reason: "malformed" };
  const v = input as Record<string, unknown>;

  if (!isNonEmptyString(v.serviceKey) || !/^[a-z0-9_-]{2,64}$/.test(v.serviceKey))
    return { ok: false, reason: "invalid_service_key" };
  if (!isNonEmptyString(v.publicLabel)) return { ok: false, reason: "malformed" };
  if (!SERVICE_TYPES.includes(v.internalServiceType as InternalServiceType))
    return { ok: false, reason: "invalid_service_type" };
  if (v.currency !== "CAD") return { ok: false, reason: "invalid_currency" };
  if (v.language !== "en" && v.language !== "fr")
    return { ok: false, reason: "invalid_language" };
  if (v.billingType !== undefined && !BILLING_TYPES.includes(v.billingType as BillingType))
    return { ok: false, reason: "invalid_billing_type" };
  if (!isNonEmptyString(v.nextDashboardPath) || !isAllowedDashboardPath(v.nextDashboardPath))
    return { ok: false, reason: "invalid_next_path" };
  if (!isNonEmptyString(v.createdAt) || !isNonEmptyString(v.expiresAt))
    return { ok: false, reason: "malformed" };

  const expires = Date.parse(v.expiresAt);
  if (Number.isNaN(expires) || expires <= now) return { ok: false, reason: "expired" };

  return { ok: true, intent: v as unknown as PublicServiceIntent };
}

/** Build an intent with timestamps applied. */
export function createServiceIntent(
  base: Omit<PublicServiceIntent, "createdAt" | "expiresAt" | "currency"> &
    Partial<Pick<PublicServiceIntent, "currency">>,
  now = Date.now(),
): PublicServiceIntent {
  return {
    ...base,
    currency: base.currency ?? "CAD",
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + INTENT_TTL_MS).toISOString(),
  };
}

/**
 * URL-safe base64 transport. Cross-domain handoff must NOT rely on
 * sessionStorage: encode the intent into the `intent` query param on the
 * dashboard sign-in URL, and let the dashboard validate + claim it after
 * Supabase login. For production, sign this payload server-side
 * (HMAC or short-lived server-stored intent ID) — this encoder is transport
 * only, never a trust boundary.
 */
export function encodeIntent(intent: PublicServiceIntent): string {
  const json = JSON.stringify(intent);
  const b64 =
    typeof btoa === "function"
      ? btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeIntent(encoded: string, now = Date.now()): IntentValidation {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob === "function"
        ? decodeURIComponent(escape(atob(b64)))
        : Buffer.from(b64, "base64").toString("utf8");
    return validateServiceIntent(JSON.parse(json), now);
  } catch {
    return { ok: false, reason: "malformed" };
  }
}