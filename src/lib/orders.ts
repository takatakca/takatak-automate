/** TAKATAK orders client.
 *  All payment processing is server-side. The browser never sees secrets;
 *  it only receives a `checkoutUrl` to redirect to (or `null` when no
 *  processor is configured yet — UI must show a safe fallback then). */
import { apiGet, apiPost } from "./api-client";

export type OrderPaymentStatus =
  | "unpaid" | "checkout_started" | "paid_to_takatak"
  | "waiting_for_takatak" | "quote_requested" | "assigned" | "in_progress"
  | "submitted" | "approved" | "grace_period" | "released" | "disputed"
  | "refunded" | "cancelled";

export interface CheckoutResponse {
  orderId: string;
  serviceInstanceId: string;
  paymentStatus: OrderPaymentStatus;
  currency: string;
  totalCents: number;
  /** null when no payment processor is configured server-side. */
  checkoutUrl: string | null;
  /** "checkout_not_configured" | "quote_only" | "checkout_provider_error" | undefined */
  reason?: string;
  /** "stripe" | "none" — purely informational; no secrets. */
  provider?: "stripe" | "none";
}

export interface OrderRecord {
  id: string;
  userId: string;
  serviceKey: string;
  serviceInstanceId?: string | null;
  status: OrderPaymentStatus;
  amountCents?: number | null;
  currency: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PackageCheckoutBody {
  packageId: string;
  title: string;
  category: string;
  tier: { name: string; priceCents: number; deliveryDays?: number };
  addons?: { label: string; priceCents: number }[];
  quantity?: number;
  currency?: string;
}

export const startPackageCheckout = (body: PackageCheckoutBody) =>
  apiPost<CheckoutResponse>(
    `/marketplace/packages/${encodeURIComponent(body.packageId)}/checkout`,
    body,
  );

export const startProjectCheckout = (projectId: string) =>
  apiPost<CheckoutResponse>(
    `/marketplace/projects/${encodeURIComponent(projectId)}/checkout`,
    {},
  );

export const listOrders = () => apiGet<{ orders: OrderRecord[] }>("/orders");
export const getOrder = (id: string) =>
  apiGet<{ order: OrderRecord }>(`/orders/${encodeURIComponent(id)}`);
export const getOrderStatus = (id: string) =>
  apiGet<{ status: OrderPaymentStatus; order: OrderRecord }>(
    `/orders/${encodeURIComponent(id)}/status`,
  );

export const QUOTE_PREFILL_KEY = "takatak_quote_prefill_v1";

export interface QuotePrefill {
  packageId: string;
  title: string;
  category: string;
  tierName: string;
  tierPriceCents: number;
  addons: { label: string; priceCents: number }[];
  totalCents: number;
  savedAt: number;
}

export function saveQuotePrefill(p: Omit<QuotePrefill, "savedAt">) {
  try {
    sessionStorage.setItem(QUOTE_PREFILL_KEY, JSON.stringify({ ...p, savedAt: Date.now() }));
  } catch {
    /* noop */
  }
}

export function readQuotePrefill(): QuotePrefill | null {
  try {
    const raw = sessionStorage.getItem(QUOTE_PREFILL_KEY);
    return raw ? (JSON.parse(raw) as QuotePrefill) : null;
  } catch {
    return null;
  }
}

export function clearQuotePrefill() {
  try { sessionStorage.removeItem(QUOTE_PREFILL_KEY); } catch { /* noop */ }
}