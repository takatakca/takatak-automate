import { PrismaClient } from "@prisma/client";
import { MARKETPLACE_CATEGORIES } from "../src/seed/marketplaceCategories.js";
import { SERVICE_DEFINITIONS } from "../src/seed/serviceDefinitions.js";

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

  // Marketplace gigs: seed nothing (no fake freelancers); categories are
  // exposed via GET /marketplace/categories and live in code, not DB.
  console.log(
    `Seeded ${portals.length} external integrations. ` +
    `${MARKETPLACE_CATEGORIES.length} marketplace categories available via GET /marketplace/categories.`,
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
