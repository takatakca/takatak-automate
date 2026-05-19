/**
 * Optional Sentry integration. App runs fine if SENTRY_DSN is unset.
 */
import { env } from "./env.js";
import * as Sentry from "@sentry/node";

let initialized = false;

export function initSentry() {
  if (initialized || !env.SENTRY_DSN) return;
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
  initialized = true;
}

export function captureException(err: unknown, ctx?: Record<string, unknown>) {
  if (!initialized) return;
  Sentry.captureException(err, ctx ? { extra: ctx } : undefined);
}

export const sentryEnabled = () => initialized;
