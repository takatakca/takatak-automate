import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { MARKETPLACE_CATEGORIES } from "../seed/marketplaceCategories.js";

export const marketplaceRouter = Router();

marketplaceRouter.get("/marketplace/categories", async (_req, res) => {
  try {
    const rows = await prisma.marketplaceCategory.findMany({ orderBy: { name: "asc" } });
    if (rows.length > 0) return res.json({ categories: rows, source: "db" });
  } catch {
    // fall through to static
  }
  res.json({ categories: MARKETPLACE_CATEGORIES, source: "static" });
});

// ---- Packages (v2) ----
const PackageQuery = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(64).optional(),
  serviceKey: z.string().trim().max(64).optional(),
  requiresIntake: z.enum(["true", "false"]).optional(),
  allowsQuote: z.enum(["true", "false"]).optional(),
  maxPriceCents: z.coerce.number().int().positive().max(100_000_000).optional(),
  maxDeliveryDays: z.coerce.number().int().positive().max(365).optional(),
  sort: z.enum(["recommended", "price_asc", "delivery_asc", "category", "newest"]).optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});

marketplaceRouter.get("/marketplace/packages", async (req, res) => {
  const parsed = PackageQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "invalid_query" });
  const q = parsed.data;

  const where: Record<string, unknown> = { active: true, status: "active" };
  if (q.category) where.category = q.category;
  if (q.serviceKey) where.serviceKey = q.serviceKey;
  if (q.requiresIntake) where.requiresIntake = q.requiresIntake === "true";
  if (q.allowsQuote) where.allowsQuote = q.allowsQuote === "true";
  if (q.maxPriceCents) where.priceCents = { lte: q.maxPriceCents };
  if (q.maxDeliveryDays) where.deliveryDays = { lte: q.maxDeliveryDays };
  if (q.q) {
    const term = q.q;
    where.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { shortDescription: { contains: term, mode: "insensitive" } },
      { longDescription: { contains: term, mode: "insensitive" } },
      { tags: { has: term.toLowerCase() } },
    ];
  }

  let orderBy: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[] = { createdAt: "desc" };
  switch (q.sort) {
    case "price_asc": orderBy = { priceCents: "asc" }; break;
    case "delivery_asc": orderBy = { deliveryDays: "asc" }; break;
    case "category": orderBy = [{ category: "asc" }, { title: "asc" }] as never; break;
    case "newest": orderBy = { createdAt: "desc" }; break;
    case "recommended":
    default: orderBy = [{ category: "asc" }, { priceCents: "asc" }] as never;
  }

  try {
    const packages = await prisma.marketplacePackage.findMany({
      where, orderBy, take: q.limit ?? 100,
    });
    res.json({ packages, count: packages.length });
  } catch {
    res.status(503).json({ error: "catalog_unavailable", packages: [] });
  }
});

marketplaceRouter.get("/marketplace/packages/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const pkg =
      (await prisma.marketplacePackage.findUnique({ where: { slug } })) ??
      (await prisma.marketplacePackage.findUnique({ where: { id: slug } }));
    if (!pkg || !pkg.active || pkg.status !== "active") {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ package: pkg });
  } catch {
    res.status(503).json({ error: "catalog_unavailable" });
  }
});

marketplaceRouter.get("/marketplace/gigs", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const gigs = await prisma.marketplaceGig.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ gigs });
});

marketplaceRouter.get("/marketplace/gigs/:id", async (req, res) => {
  const gig = await prisma.marketplaceGig.findUnique({ where: { id: req.params.id } });
  if (!gig) return res.status(404).json({ error: "not_found" });
  res.json({ gig });
});

marketplaceRouter.get("/marketplace/freelancers/:id", async (req, res) => {
  const profile = await prisma.freelancerProfile.findUnique({ where: { id: req.params.id } });
  if (!profile) return res.status(404).json({ error: "not_found" });
  res.json({ profile });
});
