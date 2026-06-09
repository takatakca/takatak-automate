import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { env, corsOrigins } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";
import { initSentry, captureException } from "./lib/sentry.js";
import { requestId } from "./lib/requestId.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import {
  generalLimiter, authLimiter, startServiceLimiter,
  intakeLimiter, launchLimiter, webhookLimiter,
} from "./lib/rateLimit.js";
import { servicesRouter } from "./routes/services.js";
import { intakeRouter } from "./routes/intake.js";
import { integrationsRouter } from "./routes/integrations.js";
import { ordersRouter } from "./routes/orders.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { adminRouter } from "./routes/admin.js";
import { marketplaceRouter } from "./routes/marketplace.js";
import { searchRouter } from "./routes/search.js";
import { projectsRouter } from "./routes/projects.js";
import { freelancersRouter } from "./routes/freelancers.js";
import { notificationsRouter } from "./routes/notifications.js";

initSentry();

const app = express();
app.set("trust proxy", 1);
app.use(requestId);
app.use(pinoHttp({
  // Strip sensitive headers and bodies from request logs.
  serializers: {
    req(req: any) {
      return { id: req.id, method: req.method, url: req.url };
    },
    res(res: any) { return { statusCode: res.statusCode }; },
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-webhook-signature']",
    ],
    censor: "[redacted]",
  },
}));
app.use(cors({ origin: corsOrigins.length ? corsOrigins : true, credentials: false }));

// --- Health & readiness (no auth, no rate-limit) ---
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "ok" });
  } catch (e) {
    captureException(e, { where: "/ready" });
    res.status(503).json({ ok: false, db: "down" });
  }
});

// --- Webhooks: raw body BEFORE express.json, rate-limited ---
app.use("/api/public/webhooks", webhookLimiter);
app.use(webhooksRouter);

// --- JSON for the rest ---
app.use(express.json({ limit: "1mb" }));

// Per-route stricter limits (apply before mounting routers).
app.use("/services/start", startServiceLimiter);
app.use("/ai/intake/start", intakeLimiter);
app.use("/integrations/launch", launchLimiter);
// Auth-sensitive endpoints (placeholder paths if/when added):
app.use(["/auth", "/auth/login", "/auth/refresh"], authLimiter);

// Generic limiter for everything else.
app.use(generalLimiter);

app.use(servicesRouter);
app.use(intakeRouter);
app.use(integrationsRouter);
app.use(ordersRouter);
app.use(adminRouter);
app.use(marketplaceRouter);
app.use(searchRouter);
app.use(projectsRouter);
app.use(freelancersRouter);
app.use(notificationsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`[takatak-backend] listening on :${env.PORT}`);
});

function shutdown(signal: string) {
  console.log(`[takatak-backend] ${signal} received, shutting down`);
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (e) => { console.error("unhandledRejection", e); captureException(e); });
process.on("uncaughtException", (e) => { console.error("uncaughtException", e); captureException(e); });
