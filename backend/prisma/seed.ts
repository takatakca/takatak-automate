import { PrismaClient } from "@prisma/client";
import { MARKETPLACE_CATEGORIES } from "../src/seed/marketplaceCategories.js";
import { SERVICE_DEFINITIONS } from "../src/seed/serviceDefinitions.js";
import { MARKETPLACE_PACKAGES_SEED, assertValidSeedPackage } from "../src/seed/marketplacePackages.js";

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
  // Upserted by slug (= id) so re-running the seed never creates duplicates.
  for (const p of MARKETPLACE_PACKAGES_SEED) {
    assertValidSeedPackage(p, `package[${p.id}]`);
    const data = {
      slug: p.slug,
      title: p.title,
      category: p.category,
      description: p.description,
      shortDescription: p.shortDescription,
      longDescription: p.longDescription,
      priceCents: p.priceCents,
      currency: p.currency,
      deliveryDays: p.deliveryDays,
      deliveryEstimate: p.deliveryEstimate,
      serviceKey: p.serviceKey,
      requiresIntake: p.requiresIntake,
      allowsQuote: p.allowsQuote,
      status: p.status,
      active: p.active,
      tags: p.tags,
      tiers: p.tiers as unknown as object,
      addOns: p.addOns as unknown as object,
      deliverables: p.deliverables as unknown as object,
      faq: p.faq as unknown as object,
      metadata: p.metadata as unknown as object,
    };
    await prisma.marketplacePackage.upsert({
      where: { slug: p.slug },
      update: data,
      create: { id: p.id, ...data },
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
