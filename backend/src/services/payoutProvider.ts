/**
 * Payout provider abstraction (Stripe Connect-ready).
 *
 * SAFETY: this file never marks a payout as completed without provider
 * confirmation. When STRIPE_CONNECT_ENABLED is false (default), every
 * mutating call returns `{ ok: false, reason: "payout_provider_not_configured" }`
 * and the caller is expected to leave the contract in `release_ready`.
 */
import { env } from "../lib/env.js";

export interface ProviderResult<T = unknown> {
  ok: boolean;
  data?: T;
  reason?: string;
}

export function isConfigured(): boolean {
  return env.STRIPE_CONNECT_ENABLED && Boolean(env.STRIPE_CONNECT_CLIENT_ID);
}

export async function createConnectedAccount(freelancerId: string): Promise<ProviderResult<{ accountId: string }>> {
  if (!isConfigured()) return { ok: false, reason: "payout_provider_not_configured" };
  // Placeholder: integrate Stripe Connect Express onboarding here.
  return { ok: false, reason: "not_implemented", data: { accountId: `placeholder_${freelancerId}` } };
}

export async function createOnboardingLink(freelancerId: string, accountId: string): Promise<ProviderResult<{ url: string }>> {
  if (!isConfigured()) return { ok: false, reason: "payout_provider_not_configured" };
  return { ok: false, reason: "not_implemented", data: { url: `https://connect.stripe.com/placeholder/${accountId}?fl=${freelancerId}` } };
}

export async function createTransfer(opts: {
  destinationAccountId: string;
  amountCents: number;
  currency: string;
  metadata?: Record<string, string>;
}): Promise<ProviderResult<{ transferId: string }>> {
  if (!isConfigured()) return { ok: false, reason: "payout_provider_not_configured" };
  return { ok: false, reason: "not_implemented" };
}

export function verifyConnectWebhook(_sig: string | null, _body: string): boolean {
  if (!env.STRIPE_CONNECT_WEBHOOK_SECRET) return false;
  // Placeholder: use Stripe SDK or HMAC-SHA256 over body when wiring real provider.
  return false;
}