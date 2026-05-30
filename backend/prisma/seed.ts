import { PrismaClient } from "@prisma/client";
import { MARKETPLACE_CATEGORIES } from "../src/seed/marketplaceCategories.js";
import { SERVICE_DEFINITIONS } from "../src/seed/serviceDefinitions.js";
import { MARKETPLACE_PACKAGES_SEED } from "../src/seed/marketplacePackages.js";

const prisma = new PrismaClient();

async function main() {
  // External integrations: one row per portal slug present in service defs.
  const portals = Array.from(
    new Set(SERVICE_DEFINITIONS.map((s) => s.portalSlug).filter((p): p is string => Boolean(p))),
  );
  for (const slug of portals) {
    await prisma.externalIntegration.upsert({
      where: { serviceKey: slug },
      update: {},
      create: { serviceKey: slug, baseUrl: "", config: {} },
    });
  }

  // Marketplace categories: upsert from canonical list.
  for (const c of MARKETPLACE_CATEGORIES) {
    await prisma.marketplaceCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
  }

  // Marketplace packages: seed the catalog with freelancerId left null.
  // TAKATAK assigns a vetted freelancer per order — no fake freelancers seeded.
  for (const p of MARKETPLACE_PACKAGES_SEED) {
    await prisma.marketplacePackage.upsert({
      where: { id: p.id },
      update: {
        title: p.title,
        category: p.category,
        description: p.description,
        priceCents: p.priceCents,
        active: p.active,
      },
      create: {
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description,
        priceCents: p.priceCents,
        currency: "CAD",
        active: p.active,
      },
    });
  }

  // Marketplace gigs: seed nothing (no fake freelancers); categories are
  // exposed via GET /marketplace/categories and live in code, not DB.
  console.log(
    `Seeded ${portals.length} external integrations, ` +
    `${MARKETPLACE_CATEGORIES.length} marketplace categories, ` +
    `${MARKETPLACE_PACKAGES_SEED.length} marketplace packages.`,
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
