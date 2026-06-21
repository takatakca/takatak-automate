# TAKATAK — Live Deployment Guide (Render)

This file is the operational checklist for taking TAKATAK live on Render
and wiring the Lovable frontend to it. It does NOT change product behavior.

---

## 1. Render services (defined in `backend/render.yaml`)

| Service | Type | Start command |
|---|---|---|
| `takatak-backend` | web | `npm start` (after `npm install && prisma generate && npm run build && prisma migrate deploy`) |
| `takatak-ai-intake-worker` | worker | `npm run worker:ai-intake` |
| `takatak-payout-sweep-worker` | worker | `npm run worker:payout` |
| `takatak-notification-worker` | worker | `npm run worker:notifications` |
| `takatak-db` | Postgres | managed |

Health check path: `/health`. Region: `oregon`. Plan: `starter` (scale up later).

First-deploy steps in the Render dashboard:
1. Create the Blueprint from `backend/render.yaml`.
2. Confirm the Postgres database is provisioned and `DATABASE_URL` is linked to every service (web + 3 workers).
3. Fill every `sync: false` env var (see §2).
4. Trigger a manual deploy of the web service; `prisma migrate deploy` runs as part of the build command.
5. Seed the database once (Render Shell on the web service): `npm run prisma:seed`.
6. Run the smoke test from your laptop: `BASE_URL=https://<web-service>.onrender.com ./backend/scripts/smoke-test.sh`.

---

## 2. Required env vars

### Web service (`takatak-backend`)

| Key | Required | Notes |
|---|---|---|
| `NODE_ENV` | yes | `production` |
| `DATABASE_URL` | yes | Linked from `takatak-db` |
| `AUTH_JWT_SECRET` | yes | HS256 shared secret used by the frontend issuer |
| `AUTH_JWKS_URL` | optional | If using an external JWKS issuer instead of HS256 |
| `CORS_ORIGINS` | yes | `https://takatak.ca,https://app.takatak.ca,https://*.lovable.app` |
| `PORTAL_SIGNING_SECRET` | yes | ≥16 chars; signs portal-launch tokens |
| `PORTAL_LAUNCH_TTL_SECONDS` | optional | default `120` |
| `UPMIND_WEBHOOK_SECRET` | yes (when Upmind is live) | HMAC-SHA256 over raw body |
| `AUTOMATION_WEBHOOK_SECRET` | yes (when automation is live) | HMAC-SHA256 over raw body |
| `PAYMENT_PROVIDER` | yes | `stripe` once Stripe is live, otherwise `none` |
| `STRIPE_SECRET_KEY` | conditional | Required when `PAYMENT_PROVIDER=stripe` |
| `STRIPE_WEBHOOK_SECRET` | conditional | Required when `PAYMENT_PROVIDER=stripe` |
| `PAYMENT_SUCCESS_URL` | yes | `https://takatak.ca/dashboard/orders?status=success` |
| `PAYMENT_CANCEL_URL` | yes | `https://takatak.ca/checkout?status=cancelled` |
| `EMAIL_PROVIDER` | yes | `resend` once Resend is live, otherwise `none` |
| `RESEND_API_KEY` | conditional | Required when `EMAIL_PROVIDER=resend` |
| `EMAIL_FROM` | conditional | e.g. `TAKATAK <notify@takatak.ca>` |
| `SUPPORT_EMAIL` | yes | default `support@takatak.ca` |
| `APP_BASE_URL` | yes | `https://takatak.ca` |
| `QMAPS_PORTAL_BASE_URL` | optional | Per-portal launch URLs |
| `FLEXS_PORTAL_BASE_URL` | optional | |
| `SOCIAL_PORTAL_BASE_URL` | optional | |
| `VOIP_PORTAL_BASE_URL` | optional | |
| `MARKETING_PORTAL_BASE_URL` | optional | |
| `MARKETPLACE_PORTAL_BASE_URL` | optional | |
| `LOVABLE_API_KEY` | optional | AI gateway key for backend AI calls |
| `SENTRY_DSN` | optional | Server-side error capture |
| `STRIPE_CONNECT_ENABLED` | leave `false` | Flip to `true` only after Connect is fully wired |
| `STRIPE_CONNECT_CLIENT_ID` | leave unset | |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | leave unset | |
| `STRIPE_PLATFORM_FEE_PERCENT` | optional | default `0` |

### Worker overrides

- **payout sweep worker**: `WORKER_POLL_MS=30000`, `PAYOUT_PROVIDER=none`, `PAYOUT_GRACE_PERIOD_HOURS=72`, `STRIPE_CONNECT_ENABLED=false`. While disabled, sweeps move contracts into `release_ready` only; no fake payouts.
- **notification worker**: `WORKER_POLL_MS=60000`, `ADMIN_NOTIFICATION_USER_ID=<admin user id>`, `EMAIL_PROVIDER=none` until Resend ready.
- **ai intake worker**: `WORKER_POLL_MS=5000`, `WORKER_BATCH=5`, `WORKER_MAX_ATTEMPTS=5`, `WORKER_STUCK_MS=600000`.

### Frontend (Lovable hosting environment)

The browser never talks to Render directly. The TanStack server function at
`src/lib/render-proxy.functions.ts` reads `RENDER_API_BASE_URL` server-side.

| Key | Required | Notes |
|---|---|---|
| `RENDER_API_BASE_URL` | yes | e.g. `https://takatak-backend.onrender.com` |

Set this in Lovable → Project Settings → Secrets (so it is available to
server functions at runtime). It is **not** a `VITE_*` var and must not
leak to the client bundle.

---

## 3. Production commands (run on Render web service)

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed          # once, or after catalog changes
npm run build
npm start
```

`render.yaml` already chains `npm install && npm run prisma:generate && npm run build && npm run prisma:deploy` as the build command and `npm start` as the start command. Seeding is run manually on first deploy.

---

## 4. Smoke test

Script: `backend/scripts/smoke-test.sh`. Runs without secrets and verifies:

- `GET /health` → 200
- `GET /ready` → 200 (or 503 if DB still warming up)
- `GET /marketplace/categories` → 200
- `GET /marketplace/packages` → 200
- `GET /user/services` → 401/403 without auth
- `POST /integrations/launch` → 401/403 without auth
- `GET /notifications` → 401/403 without auth
- `POST /api/public/webhooks/payments` without signature → 400/401
- `POST /api/public/webhooks/upmind` without signature → 400/401
- `POST /api/public/webhooks/automation` without signature → 400/401

```bash
BASE_URL=https://takatak-backend.onrender.com ./backend/scripts/smoke-test.sh
```

---

## 5. Upmind webhook

- URL: `https://<web-service>.onrender.com/api/public/webhooks/upmind`
- Header: `x-webhook-signature: <hex HMAC-SHA256 of raw body using UPMIND_WEBHOOK_SECRET>`
- Events handled: `order.paid`, `service.active`, `service.suspended`, `order.cancelled`
- Effect: locates `ServiceInstance` by `upmindOrderId`/`upmindServiceId` (or creates one when `userId`+`serviceKey` are supplied) and transitions its state via the state machine.
- Idempotency: `WebhookEvent.id` uniqueness; duplicates respond `{ received: true, duplicate: true }`.

## 6. Payment (Stripe) webhook

- URL: `https://<web-service>.onrender.com/api/public/webhooks/payments`
- Header: `stripe-signature` (or `x-webhook-signature` fallback)
- Secret env var: `STRIPE_WEBHOOK_SECRET`
- Required events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `checkout.session.expired`.
- Effect: updates `Order.status` (`paid_to_takatak` / `cancelled` / `refunded` / `unpaid`), advances the linked `ServiceInstance` through `payment_pending → paid → waiting_for_takatak`, and updates `ClientProject.paymentState` for marketplace projects.
- Duplicate behavior: idempotent via `WebhookEvent.id` (provider event id); duplicates respond `{ received: true, duplicate: true, processed: false }` — **never** re-credits an order.
- Missing/invalid signature → 401 with no state mutation.

---

## 7. Rollback plan

**Frontend (Lovable):** Project → Deploys → pick the previous green deploy → Promote. The frontend keeps its static marketplace fallback, so even with the backend offline the catalog pages render.

**Backend (Render web service):** Render dashboard → service → Deploys → pick previous successful deploy → "Rollback to this deploy". The build command re-runs `prisma migrate deploy`; if the rollback predates a destructive migration, restore the database first (next step).

**Database:** Render Postgres → Backups → choose a snapshot taken before the bad deploy → Restore (creates a fresh DB) → swap `DATABASE_URL` on the web service and all workers → redeploy.

**Disable workers safely:** in Render, suspend each worker (`takatak-payout-sweep-worker`, `takatak-notification-worker`, `takatak-ai-intake-worker`). No customer-facing state is corrupted because the payout sweep only marks contracts `release_ready` while `STRIPE_CONNECT_ENABLED=false`.

**Disable payment webhooks temporarily:** in Stripe dashboard → Webhooks → disable the production endpoint. Existing paid orders are unaffected; new payments will not advance to `paid_to_takatak` until re-enabled. Stripe automatically retries delivered events for up to 3 days, so re-enabling re-drives the queue without manual replay.

**Disable Upmind webhook:** flip `UPMIND_WEBHOOK_SECRET` to an unused value to fail-closed (signature checks reject), or disable the endpoint in Upmind.

---

## 8. Manual steps that remain in the Render dashboard

1. Provision the Postgres DB and link `DATABASE_URL` to web + 3 workers.
2. Fill every `sync: false` secret in §2.
3. Run `npm run prisma:seed` once via Render Shell after the first deploy.
4. Add the production custom domain (`api.takatak.ca`) and enable HTTPS.
5. Configure Stripe webhook endpoint and copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
6. Configure Upmind webhook endpoint and copy its signing secret into `UPMIND_WEBHOOK_SECRET`.
7. In Lovable hosting env, set `RENDER_API_BASE_URL` to the Render web URL.