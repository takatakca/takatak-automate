import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { env, corsOrigins } from "./lib/env.js";
import { servicesRouter } from "./routes/services.js";
import { intakeRouter } from "./routes/intake.js";
import { integrationsRouter } from "./routes/integrations.js";
import { ordersRouter } from "./routes/orders.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { adminRouter } from "./routes/admin.js";
import { marketplaceRouter } from "./routes/marketplace.js";

const app = express();
app.use(pinoHttp());
app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: false,
  }),
);

// Webhooks need RAW body; mount BEFORE express.json().
app.use(webhooksRouter);

// JSON for everything else.
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(servicesRouter);
app.use(intakeRouter);
app.use(integrationsRouter);
app.use(ordersRouter);
app.use(adminRouter);
app.use(marketplaceRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: "not_found" }));

// Error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

app.listen(env.PORT, () => {
  console.log(`[takatak-backend] listening on :${env.PORT}`);
});
