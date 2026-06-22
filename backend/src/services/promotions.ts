import { prisma } from "../lib/prisma.js";
import type { Promotion, PromotionStatus } from "@prisma/client";

export const PROMO_CATALOG: Record<
  string,
  {
    code: string;
    type: "percent" | "fixed";
    percentOff: number;
    amountOffCents: number;
    description: string;
    firstOrderOnly: boolean;
  }
> = {
  FIRST10: {
    code: "FIRST10",
    type: "percent",
    percentOff: 10,
    amountOffCents: 0,
    description: "10% off your first TAKATAK service",
    firstOrderOnly: true,
  },
};

export function normalizeCode(code: string): string {
  return String(code || "").trim().toUpperCase();
}

export function isUsable(p: Promotion): boolean {
  if (!p) return false;
  if (p.status === "redeemed" || p.status === "cancelled" || p.status === "expired") return false;
  if (p.expiresAt && p.expiresAt.getTime() < Date.now()) return false;
  return true;
}

/** Get or create the promo row for a user. Idempotent. */
export async function claimPromotion(userId: string, rawCode: string): Promise<{ promotion: Promotion } | { error: string }> {
  const code = normalizeCode(rawCode);
  const def = PROMO_CATALOG[code];
  if (!def) return { error: "invalid_code" };
  const existing = await prisma.promotion.findUnique({
    where: { userId_code: { userId, code } },
  });
  if (existing) {
    if (existing.status === "redeemed") return { error: "ineligible_already_used" };
    if (existing.status === "cancelled" || existing.status === "expired") return { error: "ineligible_expired" };
    return { promotion: existing };
  }
  const promotion = await prisma.promotion.create({
    data: {
      userId,
      code,
      type: def.type,
      percentOff: def.percentOff,
      amountOffCents: def.amountOffCents,
      status: "claimed",
      claimedAt: new Date(),
      metadata: { description: def.description },
    },
  });
  return { promotion };
}

/** Compute discount cents server-side. */
export function computeDiscount(p: Promotion, subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  if (p.type === "percent") {
    return Math.min(subtotalCents, Math.round((subtotalCents * p.percentOff) / 100));
  }
  return Math.min(subtotalCents, p.amountOffCents);
}

/** Returns true if user has any prior paid order — FIRST10 is for first order only. */
export async function userHasPriorPaidOrder(userId: string, excludeOrderId?: string): Promise<boolean> {
  const count = await prisma.order.count({
    where: {
      userId,
      status: { in: ["paid_to_takatak", "paid", "released", "approved", "in_progress", "submitted"] },
      ...(excludeOrderId ? { NOT: { id: excludeOrderId } } : {}),
    },
  });
  return count > 0;
}

export interface PromoApplicationResult {
  ok: true;
  promotion: Promotion;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}
export interface PromoApplicationError {
  ok: false;
  reason: string;
}

/**
 * Validate + compute discount for an in-flight checkout. Does NOT mark the
 * promotion applied — callers persist via attachPromotionToOrder.
 */
export async function previewPromotion(
  userId: string,
  rawCode: string,
  subtotalCents: number,
): Promise<PromoApplicationResult | PromoApplicationError> {
  const code = normalizeCode(rawCode);
  const def = PROMO_CATALOG[code];
  if (!def) return { ok: false, reason: "invalid_code" };
  let promo = await prisma.promotion.findUnique({ where: { userId_code: { userId, code } } });
  if (!promo) {
    // Auto-claim on first use so the existing UX (signup → checkout) keeps working.
    const claimed = await claimPromotion(userId, code);
    if ("error" in claimed) return { ok: false, reason: claimed.error };
    promo = claimed.promotion;
  }
  if (!isUsable(promo)) return { ok: false, reason: "ineligible_already_used" };
  if (def.firstOrderOnly && (await userHasPriorPaidOrder(userId))) {
    return { ok: false, reason: "ineligible_not_first_order" };
  }
  const discountCents = computeDiscount(promo, subtotalCents);
  return {
    ok: true,
    promotion: promo,
    subtotalCents,
    discountCents,
    totalCents: Math.max(0, subtotalCents - discountCents),
  };
}

/** Mark a promotion as 'applied' to a draft (unpaid) order. */
export async function attachPromotionToOrder(promotionId: string, orderId: string): Promise<Promotion> {
  return prisma.promotion.update({
    where: { id: promotionId },
    data: {
      status: "applied",
      appliedAt: new Date(),
      orderId,
    },
  });
}

/** Called from verified payment webhook. Idempotent. */
export async function redeemPromotionForOrder(orderId: string): Promise<Promotion | null> {
  const promo = await prisma.promotion.findFirst({ where: { orderId } });
  if (!promo) return null;
  if (promo.status === "redeemed") return promo;
  return prisma.promotion.update({
    where: { id: promo.id },
    data: { status: "redeemed", redeemedAt: new Date() },
  });
}

/** Release a promo back to 'claimed' when payment fails/cancels. */
export async function releasePromotionForOrder(orderId: string, nextStatus: PromotionStatus = "claimed"): Promise<Promotion | null> {
  const promo = await prisma.promotion.findFirst({ where: { orderId } });
  if (!promo) return null;
  if (promo.status === "redeemed") return promo; // do not touch redeemed
  return prisma.promotion.update({
    where: { id: promo.id },
    data: { status: nextStatus, appliedAt: null, orderId: null },
  });
}