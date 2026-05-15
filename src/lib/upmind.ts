/**
 * TAKATAK Upmind config abstraction.
 * All Upmind URLs read from VITE_* env with safe fallbacks so widgets keep
 * working even if env vars are unset. Used by domain, hosting, checkout.
 */
const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

export const UPMIND_ORDER_CONFIG_URL =
  env.VITE_UPMIND_ORDER_CONFIG_URL ??
  "https://fimjpyw0mnzy.upmind.app/order/product";

export const UPMIND_WIDGET_SCRIPT_URL =
  env.VITE_UPMIND_WIDGET_SCRIPT_URL ?? "https://embed.upmind.app/upm-widget.js";

export const UPMIND_DAC_SCRIPT_URL =
  env.VITE_UPMIND_DAC_SCRIPT_URL ??
  "https://widgets.upmind.app/dac/upm-dac.min.js";

export const UPMIND_CURRENCY = env.VITE_UPMIND_CURRENCY ?? "CAD";

/**
 * Frontend-safe portal URL resolver. Backend should issue signed URLs in
 * production (POST /integrations/launch); this is the fallback only.
 */
export function resolvePortalUrl(envKey?: string): string | null {
  if (!envKey) return null;
  const v = env[envKey];
  return v && v.trim().length > 0 ? v : null;
}