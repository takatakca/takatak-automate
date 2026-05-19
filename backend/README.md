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
