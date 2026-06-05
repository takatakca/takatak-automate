/**
 * TAKATAK payment provider abstraction.
 *
 * The browser NEVER sees payment secrets. This module is the only place that
 * talks to a payment processor. Today it supports a Stripe-compatible flow:
 *
 *   - `createCheckoutSession(order)` — creates a hosted checkout session,
 *     returns `{ checkoutUrl }` or `{ reason: "checkout_not_configured" }`
 *     when no provider credentials are configured.
 *   - `verifyPaymentWebhook(rawBody, signatureHeader)` — verifies a
 *     Stripe-compatible webhook signature using `STRIPE_WEBHOOK_SECRET`.
 *   - `mapPaymentEventToOrderState(event)` — translates a verified provider
 *     event into our internal order state machine.
 *
 * If a provider is not configured we NEVER mark anything paid; callers must
 * keep the order in `unpaid` and surface `checkout_not_configured` to the UI.
 */
import crypto from "node:crypto";

export type PaymentProvider = "stripe" | "none";

export interface PaymentOrderInput {
  orderId: string;
  amountCents: number;
  currency: string;
  description: string;
  customerEmail?: string | null;
  metadata?: Record<string, string>;
}

export interface CheckoutCreated {
  checkoutUrl: string;
  providerSessionId: string;
  provider: PaymentProvider;
}
export interface CheckoutNotConfigured {
  reason: "checkout_not_configured";
  provider: PaymentProvider;
}
export type CreateCheckoutResult = CheckoutCreated | CheckoutNotConfigured;

export interface VerifiedPaymentEvent {
  id: string;
  type: string;
  orderId?: string;
  providerSessionId?: string;
  amountCents?: number;
  currency?: string;
  raw: unknown;
}

export type MappedOrderState =
  | "paid_to_takatak"
  | "payment_pending"
  | "cancelled"
  | "refunded"
  | "failed"
  | null;

export function getPaymentProvider(): PaymentProvider {
  const wanted = (process.env.PAYMENT_PROVIDER ?? "stripe").toLowerCase();
  if (wanted === "stripe" && process.env.STRIPE_SECRET_KEY) return "stripe";
  return "none";
}

export function isPaymentConfigured(): boolean {
  return getPaymentProvider() !== "none";
}

/**
 * Create a Stripe Checkout Session via REST API (no SDK dependency). When the
 * provider is not configured returns `checkout_not_configured` — caller MUST
 * keep the order unpaid.
 */
export async function createCheckoutSession(
  order: PaymentOrderInput,
): Promise<CreateCheckoutResult> {
  const provider = getPaymentProvider();
  if (provider !== "stripe") {
    return { reason: "checkout_not_configured", provider: "none" };
  }
  const successUrl =
    process.env.PAYMENT_SUCCESS_URL ??
    "https://takatak.ca/dashboard/orders?status=success";
  const cancelUrl =
    process.env.PAYMENT_CANCEL_URL ??
    "https://takatak.ca/dashboard/orders?status=cancelled";

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${successUrl}&order_id=${encodeURIComponent(order.orderId)}`);
  form.set("cancel_url", `${cancelUrl}&order_id=${encodeURIComponent(order.orderId)}`);
  form.set("client_reference_id", order.orderId);
  if (order.customerEmail) form.set("customer_email", order.customerEmail);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", order.currency.toLowerCase());
  form.set("line_items[0][price_data][unit_amount]", String(order.amountCents));
  form.set(
    "line_items[0][price_data][product_data][name]",
    order.description.slice(0, 250),
  );
  form.set("metadata[orderId]", order.orderId);
  for (const [k, v] of Object.entries(order.metadata ?? {})) {
    form.set(`metadata[${k}]`, String(v).slice(0, 500));
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`stripe_checkout_failed_${res.status}_${detail.slice(0, 120)}`);
  }
  const json = (await res.json()) as { id?: string; url?: string };
  if (!json.url || !json.id) throw new Error("stripe_checkout_invalid_response");
  return { checkoutUrl: json.url, providerSessionId: json.id, provider: "stripe" };
}

/**
 * Verify a Stripe-compatible signature header: `t=<timestamp>,v1=<sig>`.
 * Tolerates a 5-minute clock skew.
 */
export function verifyPaymentWebhook(
  rawBody: string,
  signatureHeader: string | null | undefined,
): VerifiedPaymentEvent | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return null;
  const parts = signatureHeader.split(",").map((p) => p.trim());
  const t = parts.find((p) => p.startsWith("t="))?.slice(2);
  const v1 = parts.find((p) => p.startsWith("v1="))?.slice(3);
  if (!t || !v1) return null;
  const ts = Number(t);
  if (!Number.isFinite(ts)) return null;
  if (Math.abs(Date.now() / 1000 - ts) > 60 * 5) return null;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${t}.${rawBody}`)
    .digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let parsed: any;
  try { parsed = JSON.parse(rawBody); } catch { return null; }
  if (!parsed?.id || !parsed?.type) return null;
  const obj = parsed.data?.object ?? {};
  return {
    id: String(parsed.id),
    type: String(parsed.type),
    orderId:
      obj.client_reference_id ??
      obj.metadata?.orderId ??
      undefined,
    providerSessionId: obj.id,
    amountCents:
      typeof obj.amount_total === "number" ? obj.amount_total :
      typeof obj.amount_received === "number" ? obj.amount_received : undefined,
    currency: obj.currency ? String(obj.currency).toUpperCase() : undefined,
    raw: parsed,
  };
}

export function mapPaymentEventToOrderState(event: VerifiedPaymentEvent): MappedOrderState {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "payment_intent.succeeded":
      return "paid_to_takatak";
    case "checkout.session.async_payment_failed":
    case "payment_intent.payment_failed":
      return "failed";
    case "checkout.session.expired":
    case "payment_intent.canceled":
      return "cancelled";
    case "charge.refunded":
    case "refund.created":
      return "refunded";
    case "payment_intent.processing":
      return "payment_pending";
    default:
      return null;
  }
}