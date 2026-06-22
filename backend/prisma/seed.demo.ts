/**
 * Dev-only marketplace demo seed.
 *
 * Guard: refuses to run unless BOTH conditions are true:
 *   - NODE_ENV !== "production"
 *   - SEED_DEMO_MARKETPLACE === "true"
 *
 * Creates a complete demo journey so reviewers can walk the marketplace
 * end-to-end locally: client, freelancer, project, assigned contract,
 * milestones, messages, delivery, notification. Re-runnable (upserts).
 *
 * Never creates fake paid/released payouts: the contract is left at the
 * `assigned` state so the normal admin/freelancer/client flows drive the
 * rest of the lifecycle.
 */
import { PrismaClient } from "@prisma/client";
import { MARKETPLACE_PACKAGES_SEED, assertValidSeedPackage } from "../src/seed/marketplacePackages.js";

const prisma = new PrismaClient();

const DEMO_CLIENT = "demo-client-user";
const DEMO_FREELANCER = "demo-freelancer-user";
const DEMO_ADMIN = "demo-admin";

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("[seed.demo] refusing to run in production");
    process.exit(0);
  }
  if (process.env.SEED_DEMO_MARKETPLACE !== "true") {
    console.log("[seed.demo] skipped (SEED_DEMO_MARKETPLACE !== 'true')");
    process.exit(0);
  }

  // Freelancer profile (idempotent by unique userId).
  await prisma.freelancerProfile.upsert({
    where: { userId: DEMO_FREELANCER },
    update: { displayName: "Groupe TAKATAK Demo Freelancer", skills: ["website_design", "logo_design", "delivery_review"] },
    create: { userId: DEMO_FREELANCER, displayName: "Groupe TAKATAK Demo Freelancer", skills: ["website_design", "logo_design", "delivery_review"] },
  });

  const demoPackage = MARKETPLACE_PACKAGES_SEED.find((p) => p.slug === "website-starter") ?? MARKETPLACE_PACKAGES_SEED[0];
  assertValidSeedPackage(demoPackage, "demoPackage");
  const pkg = await prisma.marketplacePackage.upsert({
    where: { slug: demoPackage.slug },
    update: {
      title: demoPackage.title, category: demoPackage.category, description: demoPackage.description,
      shortDescription: demoPackage.shortDescription, longDescription: demoPackage.longDescription,
      priceCents: demoPackage.priceCents, currency: demoPackage.currency, deliveryDays: demoPackage.deliveryDays,
      deliveryEstimate: demoPackage.deliveryEstimate, serviceKey: demoPackage.serviceKey,
      requiresIntake: demoPackage.requiresIntake, allowsQuote: demoPackage.allowsQuote,
      status: demoPackage.status, active: demoPackage.active, tags: demoPackage.tags,
      tiers: demoPackage.tiers as unknown as object, addOns: demoPackage.addOns as unknown as object,
      deliverables: demoPackage.deliverables as unknown as object, faq: demoPackage.faq as unknown as object,
      metadata: { ...demoPackage.metadata, demo: true } as object,
    },
    create: {
      id: demoPackage.id, slug: demoPackage.slug, title: demoPackage.title, category: demoPackage.category,
      description: demoPackage.description, shortDescription: demoPackage.shortDescription,
      longDescription: demoPackage.longDescription, priceCents: demoPackage.priceCents,
      currency: demoPackage.currency, deliveryDays: demoPackage.deliveryDays,
      deliveryEstimate: demoPackage.deliveryEstimate, serviceKey: demoPackage.serviceKey,
      requiresIntake: demoPackage.requiresIntake, allowsQuote: demoPackage.allowsQuote,
      status: demoPackage.status, active: demoPackage.active, tags: demoPackage.tags,
      tiers: demoPackage.tiers as unknown as object, addOns: demoPackage.addOns as unknown as object,
      deliverables: demoPackage.deliverables as unknown as object, faq: demoPackage.faq as unknown as object,
      metadata: { ...demoPackage.metadata, demo: true } as object,
    },
  });

  await Promise.resolve().then(async () => {
    const existingOrder = await prisma.order.findFirst({
      where: { userId: DEMO_CLIENT, serviceKey: "marketplace:website_design", status: "unpaid" },
    });
    if (!existingOrder) {
      const service = await prisma.serviceInstance.create({
        data: {
          userId: DEMO_CLIENT,
          serviceKey: "marketplace:website_design",
          state: "checkout_started",
          meta: { kind: "demo_marketplace_package", packageId: pkg.id, title: pkg.title },
        },
      });
      await prisma.order.create({
        data: {
          userId: DEMO_CLIENT,
          serviceKey: "marketplace:website_design",
          serviceInstanceId: service.id,
          status: "unpaid",
          amountCents: 54900,
          currency: "CAD",
          meta: { kind: "demo_marketplace_package", packageId: pkg.id, title: pkg.title, tier: "Standard" },
        },
      });
    }
  });

  // Project — look up an existing demo project for this user so re-runs
  // reuse the same id (Prisma has no compound unique to upsert on here).
  const existing = await prisma.clientProject.findFirst({
    where: { userId: DEMO_CLIENT, title: "Demo: Starter business website" },
  });
  const project =
    existing ??
    (await prisma.clientProject.create({
      data: {
        userId: DEMO_CLIENT,
        title: "Demo: Starter business website",
        brief:
          "Five-page WordPress site for a local bakery. Contact form, photo gallery, on-page SEO.",
        category: "website_design",
        budgetCents: 54900,
        status: "assigned",
        paymentState: "assigned",
      },
    }));

  // Milestones (skip if any exist for this project).
  if ((await prisma.projectMilestone.count({ where: { projectId: project.id } })) === 0) {
    await prisma.projectMilestone.createMany({
      data: [
        { projectId: project.id, title: "Kickoff & brief", status: "completed", position: 1 },
        { projectId: project.id, title: "Design draft", status: "in_progress", position: 2 },
        { projectId: project.id, title: "Build & QA", status: "pending", position: 3 },
        { projectId: project.id, title: "Final delivery", status: "pending", position: 4 },
      ],
    });
  }

  // Client message.
  if ((await prisma.projectMessage.count({ where: { projectId: project.id } })) === 0) {
    await prisma.projectMessage.create({
      data: { projectId: project.id, fromUser: DEMO_CLIENT, body: "Looking forward to the first draft." },
    });
  }

  // Assigned contract (deterministic: skip if one exists).
  let contract = await prisma.freelancerContract.findFirst({
    where: { projectId: project.id, freelancerId: DEMO_FREELANCER },
  });
  if (!contract) {
    contract = await prisma.freelancerContract.create({
      data: {
        projectId: project.id,
        freelancerId: DEMO_FREELANCER,
        amountCents: 40000,
        currency: "CAD",
        status: "assigned",
        paymentState: "assigned",
      },
    });
    await prisma.contractAssignment.create({
      data: { contractId: contract.id, assignedBy: DEMO_ADMIN, note: "Demo seed assignment" },
    });
    await prisma.payoutHold.create({
      data: { contractId: contract.id, amountCents: contract.amountCents, currency: contract.currency, holdUntil: new Date(Date.now() + 72 * 3600_000) },
    });
  }

  // Demo delivery (visible to admin/client review screens).
  if ((await prisma.projectDelivery.count({ where: { projectId: project.id } })) === 0) {
    await prisma.projectDelivery.create({
      data: { projectId: project.id, note: "Demo: first design draft uploaded for review." },
    });
  }

  if ((await prisma.projectAuditLog.count({ where: { projectId: project.id } })) === 0) {
    await prisma.projectAuditLog.createMany({
      data: [
        { projectId: project.id, actor: DEMO_CLIENT, action: "project.created", data: { demo: true } },
        { projectId: project.id, actor: DEMO_ADMIN, action: "project.assigned", data: { contractId: contract.id, freelancerId: DEMO_FREELANCER } },
        { projectId: project.id, actor: `freelancer:${DEMO_FREELANCER}`, action: "delivery.submitted", data: { demo: true } },
      ],
    });
  }

  // Notification for the freelancer.
  if (
    (await prisma.notification.count({
      where: { userId: DEMO_FREELANCER, type: "project.assigned" },
    })) === 0
  ) {
    await prisma.notification.create({
      data: {
        userId: DEMO_FREELANCER,
        type: "project.assigned",
        title: "You've been assigned a demo contract",
        message: `TAKATAK assigned you to "${project.title}".`,
        actionUrl: `/dashboard/freelancer/contracts/${contract.id}`,
      },
    });
  }

  console.log("[seed.demo] OK", { projectId: project.id, contractId: contract.id });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
