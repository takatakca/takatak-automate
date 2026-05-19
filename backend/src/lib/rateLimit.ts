/**
 * Centralised rate limiters. Returns clean JSON errors.
 * Disable globally with RATE_LIMIT_DISABLED=true (tests / local).
 */
import rateLimit, { type Options } from "express-rate-limit";
import type { RequestHandler } from "express";
import { env } from "./env.js";

function make(opts: Partial<Options>): RequestHandler {
  if (env.RATE_LIMIT_DISABLED) {
    return (_req, _res, next) => next();
  }
  return rateLimit({
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({ error: "rate_limited", message: "Too many requests, slow down." }),
    ...opts,
  });
}

/** General API: generous. */
export const generalLimiter = make({ windowMs: 60_000, limit: 120 });

/** Auth-sensitive (login/refresh-style) — strict. */
export const authLimiter = make({ windowMs: 60_000, limit: 10 });

/** Service start — prevents instance spam. */
export const startServiceLimiter = make({ windowMs: 60_000, limit: 10 });

/** AI intake — expensive downstream. */
export const intakeLimiter = make({ windowMs: 60_000, limit: 6 });

/** Launch URL signing — cheap but abused if leaked. */
export const launchLimiter = make({ windowMs: 60_000, limit: 30 });

/** Webhooks — high upper bound; mostly relying on HMAC + idempotency. */
export const webhookLimiter = make({ windowMs: 60_000, limit: 600 });
