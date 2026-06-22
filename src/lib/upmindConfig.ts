const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

/**
 * TAKATAK Upmind integration config.
 *
 * Centralizes every public widget/config value used by domain, hosting and
 * checkout. These are public widget URLs / product IDs only — not secrets.
 */
export const UPMIND_ORDER_CONFIG_URL =
  env.VITE_UPMIND_ORDER_CONFIG_URL ??
  "https://fimjpyw0mnzy.upmind.app/order/product";

export const UPMIND_WIDGET_SCRIPT_URL =
  env.VITE_UPMIND_WIDGET_SCRIPT_URL ?? "https://embed.upmind.app/upm-widget.js";

export const UPMIND_DAC_SCRIPT_URL =
  env.VITE_UPMIND_DAC_SCRIPT_URL ??
  "https://widgets.upmind.app/dac/upm-dac.min.js";

export const UPMIND_BRAND_ID = env.VITE_UPMIND_BRAND_ID ?? "";
export const UPMIND_ACCOUNT_ID = env.VITE_UPMIND_ACCOUNT_ID ?? "";
export const UPMIND_CURRENCY = env.VITE_UPMIND_CURRENCY ?? "CAD";
export const UPMIND_DOMAIN_SEARCH_MODE = env.VITE_UPMIND_DOMAIN_SEARCH_MODE ?? "register";
export const SUPPORTED_DOMAIN_TLDS = ["ca", "com", "net", "org"] as const;

export type SupportedDomainTld = (typeof SUPPORTED_DOMAIN_TLDS)[number];

export function getDomainOrderUrl(domain: string): string {
  const url = new URL(UPMIND_ORDER_CONFIG_URL);
  url.searchParams.set("domain", domain);
  url.searchParams.set("currency", UPMIND_CURRENCY);
  return url.toString();
}

export function getHostingOrderUrl(productId: string): string {
  const url = new URL(UPMIND_ORDER_CONFIG_URL);
  url.searchParams.set("product", productId);
  url.searchParams.set("currency", UPMIND_CURRENCY);
  return url.toString();
}

export interface UpmindHostingPlan {
  key: "portfolio" | "bronze" | "silver" | "gold";
  name: string;
  tagline: string;
  productId: string;
}

export const UPMIND_HOSTING_PLANS: UpmindHostingPlan[] = [
  {
    key: "portfolio",
    name: "Portfolio",
    tagline: "Personal sites & small portfolios.",
    productId:
      env.VITE_UPMIND_PLAN_PORTFOLIO ?? "61e50989-73d2-4752-053c-e45e610832d7",
  },
  {
    key: "bronze",
    name: "Bronze",
    tagline: "Growing WordPress sites.",
    productId:
      env.VITE_UPMIND_PLAN_BRONZE ?? "1e96d298-537d-4e75-383b-14e120637085",
  },
  {
    key: "silver",
    name: "Silver",
    tagline: "Busy business websites.",
    productId:
      env.VITE_UPMIND_PLAN_SILVER ?? "80d1639e-237d-4395-3e2a-54610589e572",
  },
  {
    key: "gold",
    name: "Gold",
    tagline: "High-traffic & e-commerce.",
    productId:
      env.VITE_UPMIND_PLAN_GOLD ?? "0381d780-e72d-4dd6-701c-8413569926e5",
  },
];