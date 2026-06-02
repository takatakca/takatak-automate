/** Enriched mirror of the frontend marketplace package catalog
 *  (src/lib/marketplacePackages.ts → copied verbatim into
 *  ./marketplacePackagesCatalog.ts in this backend tree, since the backend
 *  tsconfig rootDir = "src" and cannot import from the frontend source).
 *
 *  This module is the source-of-truth for `prisma db seed` and for any
 *  future admin import flow. Each seed entry carries the full metadata
 *  required to render the marketplace from backend data (tiers, addOns,
 *  deliverables, faq, tags, intake/quote flags, service key).
 *
 *  Rules:
 *    - upsert key is `id` (which equals the URL slug)
 *    - freelancerId stays null — TAKATAK assigns vetted freelancers per order
 *    - no fake paid orders, no fake reviews persisted as orders
 *    - currency is CAD cents
 */

import {
  MARKETPLACE_PACKAGES,
  type MarketplacePackageDetail,
  type PackageTier,
  type PackageAddon,
  type PackageFaq,
} from "./marketplacePackagesCatalog.js";

export interface SeedPackage {
  id: string;
  slug: string;
  title: string;
  category: string;
  /** Short marketing line (1 sentence). */
  shortDescription: string;
  /** Long-form description for the gig detail page. */
  longDescription: string;
  /** Legacy field kept for backward compatibility with the previous
   *  Prisma schema (`description` NOT NULL). Mirrors shortDescription. */
  description: string;
  /** Starting price in CAD cents (lowest tier). */
  priceCents: number;
  currency: "CAD";
  /** Fastest tier delivery in days, used for sort + filter. */
  deliveryDays: number;
  /** Human readable estimate ("7 days" / "7–14 days"). */
  deliveryEstimate: string;
  /** Related TAKATAK service key, mirrors src/lib/services.ts. */
  serviceKey: string;
  requiresIntake: boolean;
  allowsQuote: boolean;
  /** "active" | "draft" | "archived". */
  status: "active" | "draft" | "archived";
  /** Legacy boolean flag, mirrors status !== "archived" && active. */
  active: boolean;
  tags: string[];
  tiers: PackageTier[];
  addOns: PackageAddon[];
  deliverables: string[];
  faq: PackageFaq[];
  /** Open-ended bag for future fields (thumb kind, rating, reviews, etc.). */
  metadata: Record<string, unknown>;
}

function toSeed(p: MarketplacePackageDetail): SeedPackage {
  const minDays = Math.min(...p.tiers.map((t) => t.deliveryDays));
  const status: SeedPackage["status"] = p.tiers.length === 0 ? "draft" : "active";
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    shortDescription: p.shortDescription,
    longDescription: p.description,
    description: p.shortDescription,
    priceCents: p.tiers[0]?.priceCents ?? 0,
    currency: "CAD",
    deliveryDays: minDays,
    deliveryEstimate: p.deliveryEstimate,
    serviceKey: p.relatedServiceKey,
    requiresIntake: p.intakeRequired,
    allowsQuote: p.quoteAvailable,
    status,
    active: status === "active",
    tags: p.tags,
    tiers: p.tiers,
    addOns: p.addons,
    deliverables: p.deliverables,
    faq: p.faq,
    metadata: {
      categoryName: p.categoryName,
      thumb: p.thumb,
      rating: p.rating,
      reviews: p.reviews,
      ctaText: p.ctaText,
    },
  };
}

export const MARKETPLACE_PACKAGES_SEED: SeedPackage[] =
  MARKETPLACE_PACKAGES.map(toSeed);

/** Lightweight runtime validator used by both `prisma db seed` and the
 *  (planned) `POST /admin/marketplace/packages` route. Mirrors the Zod-style
 *  rules documented in TAKATAK_MARKETPLACE_ADMIN_API.md. Throws on the first
 *  failure with a path-prefixed message. */
export function assertValidSeedPackage(p: SeedPackage, where = "package"): void {
  const fail = (msg: string): never => { throw new Error(`${where}: ${msg}`); };
  if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) fail("id must be kebab-case");
  if (p.slug !== p.id) fail("slug must equal id");
  if (!p.title || p.title.length > 120) fail("title 1..120 chars");
  if (!p.category) fail("category required");
  if (!p.shortDescription || p.shortDescription.length > 280) fail("shortDescription 1..280 chars");
  if (!Number.isInteger(p.priceCents) || p.priceCents < 0) fail("priceCents must be a non-negative integer");
  if (p.currency !== "CAD") fail("currency must be CAD");
  if (!["active", "draft", "archived"].includes(p.status)) fail("status invalid");
  if (!Array.isArray(p.tags)) fail("tags must be array");
  if (!Array.isArray(p.tiers)) fail("tiers must be array");
  for (const t of p.tiers) {
    if (!t.name || !Number.isInteger(t.priceCents) || t.priceCents < 0) fail(`tier ${t.name} invalid price`);
    if (!Number.isInteger(t.deliveryDays) || t.deliveryDays < 1) fail(`tier ${t.name} invalid deliveryDays`);
  }
  if (!Array.isArray(p.addOns)) fail("addOns must be array");
  if (!Array.isArray(p.deliverables)) fail("deliverables must be array");
  if (!Array.isArray(p.faq)) fail("faq must be array");
}