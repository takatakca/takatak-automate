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

## Remaining production setup

- Replace HS256 JWT verification with JWKS if your auth provider uses RS256.
- Add a job worker (BullMQ / pg-boss) to consume `AutomationJob` rows and
  call back via `/api/public/webhooks/automation`.
- Wire AI intake processing to the Lovable AI Gateway (`LOVABLE_API_KEY`
  is already in env) inside the `ai_intake_processing` worker.
- Seed `MarketplaceGig` rows once freelancer onboarding is live.
- Add Sentry/observability and rate-limiting (e.g. `express-rate-limit`).

---

## Deploy to Render (one-click via render.yaml)

The repo includes `backend/render.yaml`. Two paths:

### Option A — Render Blueprint
1. Push this repo (including `backend/`) to GitHub.
2. In Render → **New +** → **Blueprint** → point at the repo.
3. Render reads `backend/render.yaml`, creates the web service + Postgres DB,
   and links `DATABASE_URL` automatically.
4. Fill the `sync: false` secrets in the dashboard (see list below).
5. (Optional) Create a second **Background Worker** service:
   - Same repo, `rootDir: backend`
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `node dist/workers/aiIntakeWorker.js`

### Option B — Manual
- New Web Service, rootDir `backend`
- Build: `npm install && npx prisma generate && npm run build && npx prisma migrate deploy`
- Start: `npm start`
- Health check: `/health`
- Add a Render Postgres DB and copy its `DATABASE_URL` into the web service.

## Database migrations

- **Production / Render:** `npx prisma migrate deploy` (runs in build command).
- **Local dev:** `npx prisma migrate dev --name <change>` to create + apply.
- **Seed external integrations + log marketplace categories:** `npm run prisma:seed`.

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
