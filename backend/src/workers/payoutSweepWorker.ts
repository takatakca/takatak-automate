/**
 * Payout sweep worker.
 *
 * Polls every WORKER_POLL_MS and releases contracts whose grace period
 * has elapsed via services/payouts.ts#sweepReleasable. When
 * STRIPE_CONNECT_ENABLED is false, releases become `release_ready` —
 * funds are never marked paid out without provider confirmation.
 *
 * Run as a separate Render worker process:
 *   node dist/workers/payoutSweepWorker.js
 */
import { env } from "../lib/env.js";
import { sweepReleasable } from "../services/payouts.js";
import { isConfigured } from "../services/payoutProvider.js";

const INTERVAL = Math.max(env.WORKER_POLL_MS, 30_000);

async function tick() {
  try {
    const out = await sweepReleasable("scheduler");
    if (out.length > 0) {
      console.log("[payoutSweep]", { provider_configured: isConfigured(), released: out });
    }
  } catch (err) {
    console.error("[payoutSweep] error", err);
  }
}

console.log("[payoutSweep] started", { intervalMs: INTERVAL, provider_configured: isConfigured() });
void tick();
setInterval(tick, INTERVAL);