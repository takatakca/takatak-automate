import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { transition } from "../services/stateMachine.js";
import {
  createCheckoutSession,
  getPaymentProvider,
  isPaymentConfigured,
} from "../services/payments.js";
import {
  attachPromotionToOrder,
  previewPromotion,
} from "../services/promotions.js";

interface PromoApplied {
  code: string;
  promotionId: string;
  discountCents: number;
}

async function maybeApplyPromo(
  userId: string,
  promoCode: string | undefined,
  subtotalCents: number,
): Promise<{ totalCents: number; discountCents: number; applied?: PromoApplied; reason?: string }> {
  if (!promoCode || subtotalCents <= 0) return { totalCents: subtotalCents, discountCents: 0 };
  const r = await previewPromotion(userId, promoCode, subtotalCents);
  if (!r.ok) return { totalCents: subtotalCents, discountCents: 0, reason: r.reason };
  return {
    totalCents: r.totalCents,
    discountCents: r.discountCents,
    applied: { code: promoCode.toUpperCase(), promotionId: r.promotion.id, discountCents: r.discountCents },
  };
}

async function tryCreateCheckout(args: {
  orderId: string;
  amountCents: number;
  currency: string;
  description: string;
  email?: string | null;
  metadata?: Record<string, string>;
}): Promise<{ checkoutUrl: string | null; reason?: string }> {
  if (!isPaymentConfigured() || args.amountCents <= 0) {
    return { checkoutUrl: null, reason: "checkout_not_configured" };
  }
  try {
    const r = await createCheckoutSession({
      orderId: args.orderId,
      amountCents: args.amountCents,
      currency: args.currency,
      description: args.description,
      customerEmail: args.email ?? null,
      metadata: args.metadata,
    });
    if ("checkoutUrl" in r) {
      const existing = await prisma.order.findUnique({
        where: { id: args.orderId },
        select: { meta: true },
      });
      const prevMeta = (existing?.meta as Record<string, unknown> | null) ?? {};
      await prisma.order.update({
        where: { id: args.orderId },
        data: {
          meta: {
            ...prevMeta,
            paymentProvider: r.provider,
            providerSessionId: r.providerSessionId,
          } as object,
        },
      });
      return { checkoutUrl: r.checkoutUrl };
    }
    return { checkoutUrl: null, reason: r.reason };
  } catch {
    return { checkoutUrl: null, reason: "checkout_provider_error" };
  }
}

export const ordersRouter = Router();

const Item = z.object({
  serviceKey: z.string().min(1).max(64),
  qty: z.number().int().positive().default(1),
  options: z.record(z.string(), z.unknown()).optional(),
});
const Body = z.object({ items: z.array(Item).min(1).max(20) });

ordersRouter.post("/orders", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const orders = await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.order.create({
        data: {
          userId: req.userId!,
          serviceKey: item.serviceKey,
          meta: { qty: item.qty, options: item.options ?? {} } as object,
        },
      }),
    ),
  );
  res.json({ orderIds: orders.map((o) => o.id) });
});

// ---- Order detail/status (user-scoped) ----
ordersRouter.get("/orders", requireAuth, async (req: AuthedRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ orders });
});

ordersRouter.get("/orders/:id", requireAuth, async (req: AuthedRequest, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!order) return res.status(404).json({ error: "not_found" });
  res.json({ order });
});

ordersRouter.get("/orders/:id/status", requireAuth, async (req: AuthedRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    select: { id: true, status: true, serviceInstanceId: true, amountCents: true, currency: true, updatedAt: true },
  });
  if (!order) return res.status(404).json({ error: "not_found" });
  res.json({ status: order.status, order });
});

// ---- Package checkout ----
// Creates an unpaid Order + draft ServiceInstance and returns a checkoutUrl
// when a payment processor is configured. Until then checkoutUrl is null —
// the frontend MUST NOT treat the order as paid.
const PackageCheckout = z.object({
  packageId: z.string().min(1).max(128),
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(64),
  tier: z.object({
    name: z.string().min(1).max(32),
    priceCents: z.number().int().nonnegative(),
    deliveryDays: z.number().int().positive().optional(),
  }),
  addons: z.array(z.object({
    label: z.string().min(1).max(120),
    priceCents: z.number().int().nonnegative(),
  })).max(20).default([]),
  quantity: z.number().int().positive().max(20).default(1),
  currency: z.string().min(3).max(8).default("CAD"),
  promoCode: z.string().min(2).max(32).optional(),
});

ordersRouter.post("/marketplace/packages/:id/checkout", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = PackageCheckout.safeParse({ ...req.body, packageId: req.params.id });
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const d = parsed.data;
  const addonsTotal = d.addons.reduce((s, a) => s + a.priceCents, 0);
  const subtotal = (d.tier.priceCents + addonsTotal) * d.quantity;
  const promo = await maybeApplyPromo(req.userId!, d.promoCode, subtotal);
  const total = promo.totalCents; // taxes computed by payment processor when configured

  const serviceKey = `marketplace:${d.category}`;
  const instance = await prisma.serviceInstance.create({
    data: {
      userId: req.userId!,
      serviceKey,
      state: "draft",
      meta: { kind: "marketplace_package", packageId: d.packageId, title: d.title } as object,
    },
  });
  await transition({
    serviceInstanceId: instance.id,
    next: "checkout_started",
    label: "Checkout started",
    message: `Package ${d.title} (${d.tier.name})`,
    actor: "client",
  });
  const order = await prisma.order.create({
    data: {
      userId: req.userId!,
      serviceKey,
      serviceInstanceId: instance.id,
      status: "unpaid",
      amountCents: total,
      currency: d.currency,
      meta: {
        kind: "marketplace_package",
        packageId: d.packageId,
        title: d.title,
        category: d.category,
        tier: d.tier,
        addons: d.addons,
        quantity: d.quantity,
        subtotalCents: subtotal,
        discountCents: promo.discountCents,
        promoCode: promo.applied?.code ?? null,
        promotionId: promo.applied?.promotionId ?? null,
        promoReason: promo.reason ?? null,
        taxesCents: 0,
        totalCents: total,
      } as object,
    },
  });
  if (promo.applied) {
    await attachPromotionToOrder(promo.applied.promotionId, order.id).catch(() => undefined);
  }

  const checkout = await tryCreateCheckout({
    orderId: order.id,
    amountCents: total,
    currency: order.currency,
    description: `${d.title} — ${d.tier.name}`,
    metadata: { packageId: d.packageId, category: d.category, kind: "marketplace_package" },
  });
  res.json({
    orderId: order.id,
    serviceInstanceId: instance.id,
    paymentStatus: order.status,
    currency: order.currency,
    totalCents: total,
    subtotalCents: subtotal,
    discountCents: promo.discountCents,
    promoCode: promo.applied?.code ?? null,
    promoReason: promo.reason ?? null,
    checkoutUrl: checkout.checkoutUrl,
    provider: getPaymentProvider(),
    reason: checkout.reason ?? null,
  });
});

// ---- Project checkout ----
ordersRouter.post("/marketplace/projects/:id/checkout", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({ promoCode: z.string().min(2).max(32).optional() });
  const parsedBody = Body.safeParse(req.body ?? {});
  const promoCode = parsedBody.success ? parsedBody.data.promoCode : undefined;
  const project = await prisma.clientProject.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!project) return res.status(404).json({ error: "not_found" });
  const subtotal = project.budgetCents ?? 0;
  const promo = await maybeApplyPromo(req.userId!, promoCode, subtotal);
  const total = promo.totalCents;
  const serviceKey = `marketplace:${project.category}`;
  const instance = await prisma.serviceInstance.create({
    data: {
      userId: req.userId!,
      serviceKey,
      state: "draft",
      meta: { kind: "marketplace_project", projectId: project.id, title: project.title } as object,
    },
  });
  await transition({
    serviceInstanceId: instance.id,
    next: "checkout_started",
    label: total > 0 ? "Checkout started" : "Quote requested",
    message: project.title,
    actor: "client",
  });
  const order = await prisma.order.create({
    data: {
      userId: req.userId!,
      serviceKey,
      serviceInstanceId: instance.id,
      status: total > 0 ? "unpaid" : "quote_requested",
      amountCents: total,
      currency: "CAD",
      meta: {
        kind: "marketplace_project",
        projectId: project.id,
        title: project.title,
        category: project.category,
        subtotalCents: subtotal,
        discountCents: promo.discountCents,
        promoCode: promo.applied?.code ?? null,
        promotionId: promo.applied?.promotionId ?? null,
        promoReason: promo.reason ?? null,
        totalCents: total,
      } as object,
    },
  });
  if (promo.applied) {
    await attachPromotionToOrder(promo.applied.promotionId, order.id).catch(() => undefined);
  }
  await prisma.projectAuditLog.create({
    data: { projectId: project.id, actor: req.userId!, action: "order.created", data: { orderId: order.id } },
  });
  const checkout = total > 0
    ? await tryCreateCheckout({
        orderId: order.id,
        amountCents: total,
        currency: order.currency,
        description: `Project: ${project.title}`,
        metadata: { projectId: project.id, category: project.category, kind: "marketplace_project" },
      })
    : { checkoutUrl: null, reason: "quote_only" };
  res.json({
    orderId: order.id,
    serviceInstanceId: instance.id,
    paymentStatus: order.status,
    currency: order.currency,
    totalCents: total,
    subtotalCents: subtotal,
    discountCents: promo.discountCents,
    promoCode: promo.applied?.code ?? null,
    promoReason: promo.reason ?? null,
    checkoutUrl: checkout.checkoutUrl,
    provider: getPaymentProvider(),
    reason: checkout.reason ?? null,
  });
});
