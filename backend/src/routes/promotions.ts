import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import {
  PROMO_CATALOG,
  claimPromotion,
  normalizeCode,
  previewPromotion,
  userHasPriorPaidOrder,
} from "../services/promotions.js";

export const promotionsRouter = Router();

/** Return the caller's current promotion state. */
promotionsRouter.get("/promotions/me", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const promotions = await prisma.promotion.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  // Surface FIRST10 availability for first-time users.
  const hasFirst10 = promotions.some((p) => p.code === "FIRST10");
  const eligible = !hasFirst10 && !(await userHasPriorPaidOrder(userId));
  const available = eligible
    ? [{ code: "FIRST10", percentOff: PROMO_CATALOG.FIRST10.percentOff, status: "available" as const }]
    : [];
  res.json({ promotions, available });
});

/** Claim a promo code. Idempotent. */
promotionsRouter.post("/promotions/claim", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({ code: z.string().min(2).max(32) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const result = await claimPromotion(req.userId!, parsed.data.code);
  if ("error" in result) return res.status(409).json({ error: result.error });
  res.json({ promotion: result.promotion });
});

/**
 * Preview / apply a promo to a draft order or to a hypothetical subtotal.
 * If orderId is provided and the order is unpaid, also marks the promotion
 * `applied` and stores the order link. The actual price is computed server-side.
 */
promotionsRouter.post("/promotions/apply", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({
    code: z.string().min(2).max(32),
    orderId: z.string().optional(),
    subtotalCents: z.number().int().nonnegative().optional(),
  });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const { code, orderId, subtotalCents } = parsed.data;

  let subtotal = subtotalCents ?? 0;
  let order = null as Awaited<ReturnType<typeof prisma.order.findFirst>> | null;
  if (orderId) {
    order = await prisma.order.findFirst({ where: { id: orderId, userId: req.userId! } });
    if (!order) return res.status(404).json({ error: "order_not_found" });
    if (["paid_to_takatak", "paid", "released", "refunded", "cancelled"].includes(order.status)) {
      return res.status(409).json({ error: "order_not_eligible", status: order.status });
    }
    subtotal = order.amountCents ?? subtotal;
  }

  const result = await previewPromotion(req.userId!, code, subtotal);
  if (!result.ok) return res.status(409).json({ error: result.reason });

  if (order) {
    await prisma.promotion.update({
      where: { id: result.promotion.id },
      data: { status: "applied", appliedAt: new Date(), orderId: order.id },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: {
        amountCents: result.totalCents,
        meta: {
          ...((order.meta as Record<string, unknown> | null) ?? {}),
          promoCode: normalizeCode(code),
          promotionId: result.promotion.id,
          subtotalCents: result.subtotalCents,
          discountCents: result.discountCents,
          totalCents: result.totalCents,
        } as object,
      },
    });
  }

  res.json({
    code: normalizeCode(code),
    promotionId: result.promotion.id,
    subtotalCents: result.subtotalCents,
    discountCents: result.discountCents,
    totalCents: result.totalCents,
  });
});

/* ---- Admin ---- */
function requireAdmin(req: AuthedRequest, res: import("express").Response): boolean {
  const roles = (req.claims?.roles as string[] | undefined) ?? [];
  if (!roles.includes("admin")) {
    res.status(403).json({ error: "forbidden" });
    return false;
  }
  return true;
}

promotionsRouter.get("/admin/promotions", requireAuth, async (req: AuthedRequest, res) => {
  if (!requireAdmin(req, res)) return;
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json({ promotions });
});

promotionsRouter.post("/admin/promotions/:id/cancel", requireAuth, async (req: AuthedRequest, res) => {
  if (!requireAdmin(req, res)) return;
  const p = await prisma.promotion.update({
    where: { id: req.params.id },
    data: { status: "cancelled" },
  });
  res.json({ promotion: p });
});

promotionsRouter.post("/admin/promotions/:id/restore", requireAuth, async (req: AuthedRequest, res) => {
  if (!requireAdmin(req, res)) return;
  const p = await prisma.promotion.update({
    where: { id: req.params.id },
    data: { status: "claimed", appliedAt: null, orderId: null },
  });
  res.json({ promotion: p });
});