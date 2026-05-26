import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { MARKETPLACE_CATEGORIES } from "../seed/marketplaceCategories.js";

export const searchRouter = Router();

/** Cross-catalog search across packages and marketplace categories. */
searchRouter.get("/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const lower = q.toLowerCase();

  const categoryHits = MARKETPLACE_CATEGORIES.filter(
    (c) => !q || c.name.toLowerCase().includes(lower) || c.slug.includes(lower),
  ).slice(0, 20);

  const packageHits = q
    ? await prisma.marketplacePackage.findMany({
        where: {
          active: true,
          ...(category ? { category } : {}),
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 20,
      })
    : [];

  const intent = classify(q);
  res.json({ query: q, intent, categories: categoryHits, packages: packageHits });
});

function classify(q: string): "domain" | "hosting" | "freelance" | "service" | "unknown" {
  if (!q) return "unknown";
  const s = q.toLowerCase();
  if (/\.(com|ca|net|org|io|app|co)\b/.test(s) || s.includes("domain")) return "domain";
  if (s.includes("host") || s.includes("cpanel")) return "hosting";
  if (/(freelanc|custom|hire|gig|logo|design|writer|writing|data entry|virtual assistant)/.test(s))
    return "freelance";
  return "service";
}