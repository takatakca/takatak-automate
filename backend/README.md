# TAKATAK Backend (Render)

Standalone Node/Express + Prisma + Postgres backend implementing the contract
the Lovable frontend expects (see `../TAKATAK_AUTOMATION_BACKEND_CONTRACT.md`).

> This folder is NOT built or deployed by Lovable. Copy it into your Render
> service repo (or deploy from a subdirectory) and run the steps below.

## Setup

1. `cd backend && npm install` (or `pnpm i` / `bun i`).
2. Copy `.env.example` to `.env` and fill values.
3. `npx prisma migrate dev --name init` (local) or `npx prisma migrate deploy` (Render).
4. `npm run dev` for local, `npm run build && npm start` for production.

## Render configuration

- **Build command:** `npm install && npx prisma generate && npm run build && npx prisma migrate deploy`
- **Start command:** `npm start`
- **Health check path:** `/health`
- Add all env vars from `.env.example` in the Render dashboard.

## Endpoints

User (require Bearer JWT):
- `GET  /user/services`
- `POST /services/start`
- `GET  /services/instances/:id`
- `GET  /services/instances/:id/timeline`
- `POST /ai/intake/start`
- `POST /integrations/launch`
- `POST /orders`
- `GET  /marketplace/gigs?category=`
- `GET  /marketplace/gigs/:id`
- `POST /marketplace/projects`
- `GET  /marketplace/freelancers/:id`

Webhooks (HMAC-SHA256 via `x-webhook-signature`):
- `POST /api/public/webhooks/upmind`
- `POST /api/public/webhooks/automation`

Admin (require `roles: ["admin"]` claim):
- `GET  /admin/automation/jobs`
- `GET  /admin/services/pending`
- `POST /admin/services/:id/assign`
- `POST /admin/services/:id/approve`
- `POST /admin/services/:id/fail`

## Auth

Verifies Bearer JWTs minted by the existing TAKATAK auth service using
`AUTH_JWT_SECRET`. For JWKS-based providers, swap `requireAuth` to use
`jwks-rsa` — the rest of the code is unchanged.

## State machine

Source of truth in `src/services/stateMachine.ts`. Illegal transitions throw;
each successful transition writes an `AutomationTimelineEvent`.

## Portal launch URLs

`POST /integrations/launch` returns an HMAC-signed, short-lived URL pointing at
the configured portal base (one of `*_PORTAL_BASE_URL` env vars). If the env
var for a service is missing, the endpoint returns `404 portal_not_configured`
and the frontend falls back gracefully. Private portal keys are NEVER returned
to the client.

## Webhook signature

```
signature = HMAC_SHA256(secret, raw_request_body_bytes)
header    = x-webhook-signature: <hex>
```

## Tests

Smoke (after `npm run dev`):

```sh
curl -s localhost:10000/health
curl -s -H "Authorization: Bearer $JWT" localhost:10000/user/services
curl -s -X POST -H "Authorization: Bearer $JWT" -H 'Content-Type: application/json' \
  -d '{"serviceKey":"local_listings"}' localhost:10000/services/start
curl -s -X POST -H "Authorization: Bearer $JWT" -H 'Content-Type: application/json' \
  -d '{"serviceKey":"qmaps"}' localhost:10000/integrations/launch
```

## Dev-only marketplace walkthrough

Use this only against local/staging data. It never marks real payments paid and never releases a real payout.
When `PAYOUT_PROVIDER=none`, the final payout test must stop at `release_ready`.

```sh
cd backend
npm install
export NODE_ENV=development
export DATABASE_URL=postgresql://user:pass@localhost:5432/takatak
export AUTH_JWT_SECRET=dev-demo-secret-change-me
export PORTAL_SIGNING_SECRET=dev-portal-signing-secret
export PAYMENT_PROVIDER=none
export PAYOUT_PROVIDER=none
export PAYOUT_GRACE_PERIOD_HOURS=72
export SEED_DEMO_MARKETPLACE=true

npx prisma generate
npx prisma migrate dev --name demo_flow_validation
npm run prisma:seed
npm run prisma:seed:demo
npm run dev
```

In another terminal, run the real endpoint walkthrough. The script generates HS256 demo JWTs from `AUTH_JWT_SECRET`; do not use this secret in production.

```sh
AUTH_JWT_SECRET=dev-demo-secret-change-me BASE_URL=http://localhost:10000 bash backend/scripts/demo-flow-test.sh
```

Frontend reviewers can also set `VITE_DEMO_MARKETPLACE=true` while walking `/dashboard/marketplace`, `/dashboard/projects/demo`, `/dashboard/admin/projects`, `/dashboard/freelancer/contracts/demo`, and `/dashboard/notifications` against that seeded backend.

## Remaining production setup

- Replace HS256 JWT verification with JWKS if your auth provider uses RS256.
- For high throughput, swap the in-process worker for BullMQ / pg-boss.
- Seed `MarketplaceGig` rows once freelancer onboarding is live.

---

## Production hardening (this phase)

- **Rate limiting** via `express-rate-limit`:
  - Auth-sensitive: 10/min
  - `/services/start`: 10/min
  - `/ai/intake/start`: 6/min
  - `/integrations/launch`: 30/min
  - Webhooks: 600/min (HMAC + idempotency carry the real load)
  - General API: 120/min
  - Disable with `RATE_LIMIT_DISABLED=true` (local/test only).
  - Errors return JSON: `{ "error": "rate_limited", "message": "..." }`.
- **Request IDs** on every response (`x-request-id`); echoed in error logs.
- **Structured logging** via `pino-http` with redaction of `authorization`,
  `cookie`, and `x-webhook-signature` headers. Bodies are never logged.
- **Centralised error handler** returns `{ error, requestId }`; logs error
  message + path only — never payloads or secrets.
- **Sentry (optional)** — set `SENTRY_DSN` to enable. App and worker run
  fine without it.
- **Health / readiness:**
  - `GET /health` — liveness (no DB).
  - `GET /ready` — verifies DB connectivity via `SELECT 1`; returns 503 if down.
  - Worker logs `starting` / `picked` / `completed` / `routed_to_human` /
    `failed` / `recovered_stuck_jobs` as structured JSON.
- **Indexes** added on `ServiceInstance(userId, serviceKey, state)`,
  `AutomationJob(status, kind, kind+status, updatedAt)`,
  `AutomationTimelineEvent(serviceInstanceId, at)`,
  `AIIntake(serviceInstanceId)`, `Order(serviceInstanceId)`,
  `WebhookEvent(receivedAt, source+receivedAt)`.
- **Worker reliability:**
  - `WORKER_MAX_ATTEMPTS` (default 5) caps retries; jobs past the cap are
    marked `failed` and surface in `/admin/exceptions`.
  - Exponential backoff (5s → 15s → 45s → … capped at 15m) between attempts.
  - Stuck `running` jobs older than `WORKER_STUCK_MS` (default 10m) are
    re-queued automatically.
  - SIGTERM/SIGINT → graceful shutdown after the in-flight job.
- **Webhook reliability:**
  - HMAC-SHA256 + constant-time compare.
  - Idempotency via `WebhookEvent` PK; duplicates return
    `{ "received": true, "duplicate": true, "processed": false }`.
  - Successful processing returns
    `{ "received": true, "duplicate": false, "processed": true }`.
  - **TTL cleanup:** run nightly via cron or `pg_cron` to prevent unbounded
    growth (events older than 30 days are safe to delete):
    ```sql
    DELETE FROM "WebhookEvent" WHERE "receivedAt" < NOW() - INTERVAL '30 days';
    ```
- **Admin endpoints** require an `admin` role claim (`roles[]`, `role`, or
  `isAdmin`). Frontend ships a hidden `/dashboard/admin/exceptions` route
  gated behind a localStorage flag until role claims are wired through auth.

---

## Deploy to Render (one-click via render.yaml)

The repo includes `backend/render.yaml`. Two paths:

### Option A — Render Blueprint
1. Push this repo (including `backend/`) to GitHub.
2. In Render → **New +** → **Blueprint** → point at the repo.
3. Render reads `backend/render.yaml`, creates the web service + Postgres DB,
   and links `DATABASE_URL` automatically.
4. Fill the `sync: false` secrets in the dashboard (see list below).
5. Render also creates the background workers declared in `render.yaml`:
   `npm run worker:ai-intake`, `npm run worker:payout`, and
   `npm run worker:notifications`.

### Option B — Manual
- New Web Service, rootDir `backend`
- Build: `npm install && npm run prisma:generate && npm run build && npm run prisma:deploy`
- Start: `npm start`
- Health check: `/health`
- Add a Render Postgres DB and copy its `DATABASE_URL` into the web service.

## Database migrations

- **Production / Render:** `npx prisma migrate deploy` (runs in build command).
- **Local dev:** `npx prisma migrate dev --name <change>` to create + apply.
- **Seed external integrations + log marketplace categories:** `npm run prisma:seed`.
- After any schema change in this repo, generate a migration locally with
  `npx prisma migrate dev --name <change>` and commit the
  `prisma/migrations/` folder. Render's build step runs `prisma migrate deploy`
  to apply them; never run `db push` against production.

Marketplace categories live in code (`src/seed/marketplaceCategories.ts`) and
are served by `GET /marketplace/categories`. No fake freelancers or gigs are
seeded — `MarketplaceGig` rows are inserted only when real freelancers onboard.

## CORS

Set `CORS_ORIGINS` to a comma-separated list. The default `render.yaml` allows:
`https://takatak.ca,https://app.takatak.ca,https://*.lovable.app`.
Add Lovable preview URLs as needed.

## Auth — required JWT claims

The backend verifies Bearer tokens minted by the existing TAKATAK auth service.
The compatibility layer (`src/middleware/auth.ts`) accepts:

| Purpose | Accepted claim names |
|---|---|
| User id | `sub`, `userId`, `id`, `user_id` |
| Roles   | `roles[]`, `role` (string), `isAdmin` (bool) |

`AUTH_JWT_SECRET` must match the secret your auth service signs with (HS256).
For RS256/JWKS, swap `jwt.verify` for `jwks-rsa` — middleware shape stays the same.

## AI intake worker behaviour

Polls `AutomationJob` rows where `kind = 'ai_intake_processing'` and `status = 'queued'`.

| AI Gateway | Result |
|---|---|
| Reachable + 2xx | Brief saved on `AIIntake.brief`; service → `waiting_for_client` |
| Missing key or non-2xx | Template brief saved; service → `waiting_for_takatak` (human review). Job marked succeeded with `lastError: "ai_unavailable_routed_to_human"` |
| Exception | Job marked `failed`; visible via `/admin/exceptions` |

No AI keys are ever exposed to the frontend.

## Webhook security

- Raw body parsed BEFORE `express.json()` so HMAC stays valid.
- HMAC-SHA256 verified in constant time via `crypto.timingSafeEqual`.
- Each event must carry an `id` field; we insert into `WebhookEvent` first
  and treat a uniqueness collision as a duplicate (returns `{ ok: true, duplicate: true }`),
  preventing duplicate state transitions / timeline events.

### Expected Upmind payload

```json
{
  "id": "evt_abc123",
  "type": "order.paid" | "service.active" | "service.suspended" | "order.cancelled",
  "orderId": "ord_...",          // optional, used to locate ServiceInstance
  "serviceId": "svc_...",        // optional, used to locate ServiceInstance
  "userId": "usr_...",           // required only when creating a new instance
  "serviceKey": "hosting"        // required only when creating a new instance
}
```

## Portal launch behaviour

`POST /integrations/launch` requires Bearer auth and accepts:

```json
{ "serviceKey": "qmaps", "serviceInstanceId": "si_..." }
```

- If `serviceInstanceId` is supplied, ownership is enforced; mismatch → `403 forbidden`.
- Returns `{ launchUrl }` only if the target portal's `*_PORTAL_BASE_URL` env var is set.
- The URL is HMAC-signed with `PORTAL_SIGNING_SECRET` and expires after
  `PORTAL_LAUNCH_TTL_SECONDS` (default 120s). Format:
  `<base>?u=<userId>&s=<serviceKey>&e=<expiresEpoch>&sig=<hmac>`.
- Private portal API keys are never returned. Missing env → `404 portal_not_configured`,
  which the frontend handles with a clean "portal not configured yet" state.

## Required env vars summary

### Frontend (Lovable) — see root `.env.example`
- Browser-safe (`VITE_*`): Upmind widget URLs, optional portal fallback URLs.
- Server-only (TanStack proxy): `RENDER_API_BASE_URL`, `*_PORTAL_URL` fallbacks.

### Backend (this folder) — see `backend/.env.example`
- DB: `DATABASE_URL`
- Auth: `AUTH_JWT_SECRET` (or `AUTH_JWKS_URL` once JWKS support is added)
- Webhooks: `UPMIND_WEBHOOK_SECRET`, `AUTOMATION_WEBHOOK_SECRET`
- Launch URLs: `PORTAL_SIGNING_SECRET`, `PORTAL_LAUNCH_TTL_SECONDS`
- Portal bases: `QMAPS_/FLEXS_/SOCIAL_/VOIP_/MARKETING_/MARKETPLACE_PORTAL_BASE_URL`
- AI: `LOVABLE_API_KEY` (server-only)
- Service: `PORT`, `NODE_ENV`, `CORS_ORIGINS`

## Remaining manual production setup

1. Create the Render Postgres DB and connect it.
2. Set all `sync: false` secrets in the Render dashboard.
3. Deploy the worker as a second Render service (Background Worker).
4. Configure Upmind to POST to `https://<render-host>/api/public/webhooks/upmind`
   with `x-webhook-signature` set to HMAC-SHA256 of the raw body.
5. Point Lovable's `RENDER_API_BASE_URL` at the deployed Render URL.
6. Issue a test JWT, hit `/health`, `/user/services`, and one webhook event
   to confirm the full pipeline.

---

## Smoke tests (post-deploy)

```sh
BASE=https://<your-render-host>
JWT=<test token>

curl -fsS $BASE/health
curl -fsS $BASE/ready

curl -fsS -H "Authorization: Bearer $JWT" $BASE/user/services

curl -fsS -X POST -H "Authorization: Bearer $JWT" -H 'Content-Type: application/json' \
  -d '{"serviceKey":"local_listings"}' $BASE/services/start

curl -fsS -X POST -H "Authorization: Bearer $JWT" -H 'Content-Type: application/json' \
  -d '{"serviceKey":"qmaps"}' $BASE/integrations/launch
# Expect 200 with launchUrl when QMAPS_PORTAL_BASE_URL is set,
# 404 portal_not_configured otherwise.
```

Webhook smoke:

```sh
BODY='{"id":"evt_test_1","type":"order.paid","orderId":"ord_1","userId":"usr_1","serviceKey":"hosting"}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$UPMIND_WEBHOOK_SECRET" -hex | awk '{print $2}')
curl -fsS -X POST -H "Content-Type: application/json" -H "x-webhook-signature: $SIG" \
  -d "$BODY" $BASE/api/public/webhooks/upmind
# Replay the same request → response should be { received:true, duplicate:true, processed:false }
```

## Rollback

- Render keeps prior deploys; use **Manual deploy → Previous successful deploy**
  to roll back the web service and the worker independently.
- For schema rollbacks, restore from a Render Postgres backup; never run
  `prisma migrate reset` against production.

---

## Operations automation (notifications + cron + payout readiness)

### Workers (run as separate Render workers)

Add two more Render Background Workers alongside the existing automation worker:

```
# Payout sweep — releases contracts past their grace period.
# When STRIPE_CONNECT_ENABLED=false, releases become `release_ready`,
# never `released`. No funds move without provider confirmation.
node dist/workers/payoutSweepWorker.js

# Notifications — scans for unpaid orders, pending freelancer acceptance,
# overdue delivery review, stuck services, and missing-provider release-ready
# contracts. Writes to the Notification table and emails when configured.
node dist/workers/notificationWorker.js
```

Both honor `WORKER_POLL_MS` (minimum 30s sweep, 60s notifications).

### Notification env vars

| Var | Purpose |
| --- | --- |
| `ADMIN_NOTIFICATION_USER_ID` | userId that receives admin.exception / payout.release_ready notifications (default: `admin`) |
| `APP_BASE_URL` | Used to build absolute `actionUrl`s in outbound emails |

### Email provider

Optional. When `EMAIL_PROVIDER=none` (default) the email service logs the
would-be send and returns `ok` — notifications still persist to the DB.

| Var | Purpose |
| --- | --- |
| `EMAIL_PROVIDER` | `resend` or `none` |
| `RESEND_API_KEY` | Required when provider = `resend` |
| `EMAIL_FROM` | e.g. `TAKATAK <noreply@takatak.ca>` |
| `SUPPORT_EMAIL` | Support reply-to address (default `support@takatak.ca`) |

Templates currently render plain text per notification type:
`order_received`, `payment_received`, `project_assigned`,
`delivery_submitted`, `revision_requested`, `approval_grace_period`,
`dispute_opened`, `payout_release_ready`.

### Stripe Connect (payout readiness)

Default is **disabled**. The payout service exposes a Connect-shaped
abstraction so wiring real transfers is additive.

| Var | Purpose |
| --- | --- |
| `STRIPE_CONNECT_ENABLED` | `false` by default. Set to `true` to call provider APIs. |
| `STRIPE_CONNECT_CLIENT_ID` | OAuth client id from Stripe Connect platform |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | Verifies Connect webhooks |
| `STRIPE_PLATFORM_FEE_PERCENT` | TAKATAK fee percentage |
| `PAYOUT_GRACE_PERIOD_HOURS` | Hold duration after client approval (default 72) |

**Payout safety rules** (do not relax):
- Sweeping a release-ready contract while Connect is disabled MUST leave it in
  `release_ready` — never mark `released` without provider confirmation.
- `payoutProvider.createTransfer()` returns `payout_provider_not_configured`
  until Connect is wired.
- Manual release process: admin acknowledges payout offline, then runs the
  sweep — the admin payout dashboard (`/dashboard/admin/payouts`) surfaces
  release-ready and disputed payouts for human action.

### Smoke tests

```sh
# Local deploy-readiness checks
cd backend && npm install
cd backend && npx prisma generate
cd backend && npm run typecheck
cd backend && npm run build
bun run build

# Notifications endpoint
curl -fsS -H "Authorization: Bearer $JWT" $BASE/notifications

# Payout sweep (admin)
curl -fsS -X POST -H "Authorization: Bearer $ADMIN_JWT" $BASE/admin/payouts/sweep
# When Connect disabled, response shows `released` items but contracts hold
# `release_ready` reference strings (`release_ready:<contractId>`).
```
