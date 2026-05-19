import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_JWT_SECRET: z.string().optional(),
  AUTH_JWKS_URL: z.string().url().optional(),
  UPMIND_WEBHOOK_SECRET: z.string().optional(),
  AUTOMATION_WEBHOOK_SECRET: z.string().optional(),
  PORTAL_SIGNING_SECRET: z.string().min(16),
  PORTAL_LAUNCH_TTL_SECONDS: z.coerce.number().int().positive().default(120),
  QMAPS_PORTAL_BASE_URL: z.string().url().optional(),
  FLEXS_PORTAL_BASE_URL: z.string().url().optional(),
  SOCIAL_PORTAL_BASE_URL: z.string().url().optional(),
  VOIP_PORTAL_BASE_URL: z.string().url().optional(),
  MARKETING_PORTAL_BASE_URL: z.string().url().optional(),
  MARKETPLACE_PORTAL_BASE_URL: z.string().url().optional(),
  LOVABLE_API_KEY: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(10000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
  CORS_ORIGINS: z.string().default(""),
  SENTRY_DSN: z.string().url().optional(),
  RATE_LIMIT_DISABLED: z.coerce.boolean().default(false),
  WORKER_POLL_MS: z.coerce.number().int().positive().default(5000),
  WORKER_BATCH: z.coerce.number().int().positive().default(5),
  WORKER_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  WORKER_STUCK_MS: z.coerce.number().int().positive().default(10 * 60 * 1000),
});

export const env = schema.parse(process.env);
export const corsOrigins = env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
