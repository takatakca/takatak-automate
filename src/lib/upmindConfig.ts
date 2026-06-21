/**
 * TAKATAK Upmind integration config.
 *
 * Re-exports the core Upmind URLs / currency from `src/lib/upmind.ts` and
 * adds the production hosting-plan IDs ported from the legacy Next.js site.
 * All public — these are Upmind product IDs, not secrets.
 *
 * Env overrides (optional):
 *   VITE_UPMIND_PLAN_PORTFOLIO, VITE_UPMIND_PLAN_BRONZE,
 *   VITE_UPMIND_PLAN_SILVER, VITE_UPMIND_PLAN_GOLD
 */
export {
  UPMIND_ORDER_CONFIG_URL,
  UPMIND_WIDGET_SCRIPT_URL,
  UPMIND_DAC_SCRIPT_URL,
  UPMIND_CURRENCY,
} from "./upmind";

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

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