/** Backend-first marketplace catalog loader with static fallback.
 *
 *  Frontend pages call these helpers (typically through React Query) instead
 *  of importing the static catalog directly. When the backend responds, we
 *  map the Prisma `MarketplacePackage` row back into the rich
 *  `MarketplacePackageDetail` shape the UI was built on. If the backend
 *  errors, returns empty, or the proxy is unavailable, we fall back to the
 *  bundled `MARKETPLACE_PACKAGES` so the marketplace never goes blank.
 *
 *  Each function returns `{ source: "backend" | "fallback", ... }` so a
 *  dev-only indicator can show which path served the data.
 */
import { apiGet } from "./api-client";
import {
  MARKETPLACE_PACKAGES,
  PACKAGE_CATEGORIES_DISPLAY,
  getPackage as getLocalPackage,
  searchPackages as searchLocalPackages,
  getPackagesByCategory as getLocalPackagesByCategory,
  shortestDelivery,
  type MarketplacePackageDetail,
  type PackageTier,
  type PackageAddon,
  type PackageFaq,
  type ThumbKind,
} from "./marketplacePackages";
import {
  MARKETPLACE_CATEGORIES,
  type MarketplaceCategory,
} from "./marketplaceCategories";

export type CatalogSource = "backend" | "fallback";

export interface CatalogResult<T> {
  source: CatalogSource;
  data: T;
}

export interface PackageFilters {
  q?: string;
  category?: string;
  serviceKey?: string;
  requiresIntake?: boolean;
  allowsQuote?: boolean;
  maxPriceCents?: number;
  maxDeliveryDays?: number;
  sort?: "recommended" | "price_asc" | "delivery_asc" | "category" | "newest";
}

interface BackendPackage {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  description?: string | null;
  priceCents: number;
  currency?: string;
  deliveryDays?: number | null;
  deliveryEstimate?: string | null;
  serviceKey?: string | null;
  requiresIntake?: boolean;
  allowsQuote?: boolean;
  status?: string;
  active?: boolean;
  tags?: string[];
  tiers?: PackageTier[] | null;
  addOns?: PackageAddon[] | null;
  deliverables?: string[] | null;
  faq?: PackageFaq[] | null;
  metadata?: {
    categoryName?: string;
    thumb?: ThumbKind;
    rating?: number;
    reviews?: number;
    ctaText?: string;
  } | null;
}

const CATEGORY_NAME_BY_SLUG = new Map(
  PACKAGE_CATEGORIES_DISPLAY.map((c) => [c.slug, c.name]),
);

/** Convert a backend Prisma row into the UI's MarketplacePackageDetail shape. */
function adaptBackendPackage(p: BackendPackage): MarketplacePackageDetail {
  const tiers = Array.isArray(p.tiers) && p.tiers.length > 0 ? p.tiers : [];
  const fastest = tiers.length
    ? Math.min(...tiers.map((t) => t.deliveryDays))
    : p.deliveryDays ?? 7;
  const slowest = tiers.length
    ? Math.max(...tiers.map((t) => t.deliveryDays))
    : fastest;
  const deliveryEstimate =
    p.deliveryEstimate ||
    (fastest === slowest ? `${fastest} days` : `${fastest}–${slowest} days`);
  const meta = p.metadata ?? {};
  const blurb = p.shortDescription || p.description || "";
  return {
    id: p.id,
    slug: p.slug || p.id,
    title: p.title,
    category: p.category,
    categoryName:
      meta.categoryName ||
      CATEGORY_NAME_BY_SLUG.get(p.category) ||
      p.category.replace(/_/g, " "),
    blurb,
    shortDescription: blurb,
    description: p.longDescription || p.description || blurb,
    thumb: (meta.thumb as ThumbKind) || "website",
    rating: typeof meta.rating === "number" ? meta.rating : 5.0,
    reviews: typeof meta.reviews === "number" ? meta.reviews : 0,
    deliveryEstimate,
    tiers,
    addons: Array.isArray(p.addOns) ? p.addOns : [],
    faq: Array.isArray(p.faq) ? p.faq : [],
    deliverables: Array.isArray(p.deliverables) ? p.deliverables : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
    keywords: Array.isArray(p.tags) ? p.tags : [],
    relatedServiceKey: p.serviceKey || "",
    intakeRequired: !!p.requiresIntake,
    quoteAvailable: p.allowsQuote ?? true,
    ctaText: meta.ctaText || "Continue",
  };
}

function buildQuery(filters: PackageFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.serviceKey) params.set("serviceKey", filters.serviceKey);
  if (filters.requiresIntake !== undefined)
    params.set("requiresIntake", filters.requiresIntake ? "true" : "false");
  if (filters.allowsQuote !== undefined)
    params.set("allowsQuote", filters.allowsQuote ? "true" : "false");
  if (filters.maxPriceCents)
    params.set("maxPriceCents", String(filters.maxPriceCents));
  if (filters.maxDeliveryDays)
    params.set("maxDeliveryDays", String(filters.maxDeliveryDays));
  if (filters.sort) params.set("sort", filters.sort);
  const s = params.toString();
  return s ? `?${s}` : "";
}

function applyLocalFilters(
  list: MarketplacePackageDetail[],
  filters: PackageFilters,
): MarketplacePackageDetail[] {
  let arr = list;
  if (filters.q) {
    const term = filters.q.toLowerCase();
    arr = arr.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.blurb.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term)),
    );
  }
  if (filters.category) arr = arr.filter((p) => p.category === filters.category);
  if (filters.serviceKey)
    arr = arr.filter((p) => p.relatedServiceKey === filters.serviceKey);
  if (filters.requiresIntake !== undefined)
    arr = arr.filter((p) => p.intakeRequired === filters.requiresIntake);
  if (filters.allowsQuote !== undefined)
    arr = arr.filter((p) => p.quoteAvailable === filters.allowsQuote);
  if (filters.maxPriceCents)
    arr = arr.filter(
      (p) => Math.min(...p.tiers.map((t) => t.priceCents)) <= filters.maxPriceCents!,
    );
  if (filters.maxDeliveryDays)
    arr = arr.filter((p) => shortestDelivery(p) <= filters.maxDeliveryDays!);

  const sorted = arr.slice();
  switch (filters.sort) {
    case "price_asc":
      sorted.sort(
        (a, b) =>
          Math.min(...a.tiers.map((t) => t.priceCents)) -
          Math.min(...b.tiers.map((t) => t.priceCents)),
      );
      break;
    case "delivery_asc":
      sorted.sort((a, b) => shortestDelivery(a) - shortestDelivery(b));
      break;
    case "category":
      sorted.sort((a, b) => a.category.localeCompare(b.category));
      break;
    case "newest":
      // Local catalog has no createdAt; preserve declaration order.
      break;
    default:
      break;
  }
  return sorted;
}

/* ---------------- Public loaders ---------------- */

export async function getMarketplaceCategories(): Promise<
  CatalogResult<MarketplaceCategory[]>
> {
  try {
    const res = await apiGet<{ categories: MarketplaceCategory[] }>(
      "/marketplace/categories",
    );
    if (res?.categories?.length) {
      return { source: "backend", data: res.categories };
    }
  } catch {
    // fall through
  }
  return { source: "fallback", data: MARKETPLACE_CATEGORIES };
}

export async function getMarketplacePackages(
  filters: PackageFilters = {},
): Promise<CatalogResult<MarketplacePackageDetail[]>> {
  try {
    const res = await apiGet<{ packages: BackendPackage[] }>(
      `/marketplace/packages${buildQuery(filters)}`,
    );
    if (res?.packages?.length) {
      return { source: "backend", data: res.packages.map(adaptBackendPackage) };
    }
  } catch {
    // fall through
  }
  const fallback = filters.q
    ? searchLocalPackages(filters.q, filters.category)
    : filters.category
      ? getLocalPackagesByCategory(filters.category)
      : MARKETPLACE_PACKAGES;
  return { source: "fallback", data: applyLocalFilters(fallback, filters) };
}

export async function getMarketplacePackage(
  slug: string,
): Promise<CatalogResult<MarketplacePackageDetail | null>> {
  try {
    const res = await apiGet<{ package: BackendPackage }>(
      `/marketplace/packages/${encodeURIComponent(slug)}`,
    );
    if (res?.package) {
      return { source: "backend", data: adaptBackendPackage(res.package) };
    }
  } catch {
    // fall through
  }
  return { source: "fallback", data: getLocalPackage(slug) ?? null };
}
