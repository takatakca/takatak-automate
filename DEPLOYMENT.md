# TAKATAK frontend — deployment

## ⚠️ Render: legacy `node index.js` / MongoDB error

If a Render service is crashing with logs like:

```
Running 'node index.js'
Error: querySrv ENOTFOUND _mongodb._tcp.cluster0.mjle4b3.mongodb.net
```

…the service is still using an **old project's Build/Start commands**. This
repo has no `index.js`, no MongoDB code, and no `MONGO_URI`. Fix it in Render
by updating the service settings (or recreate from `render.yaml` at the repo
root):

- **Frontend service** — Build: `npm install && npm run build` · Start: `node start.mjs` · Root: repo root
- **Backend service**  — Build: `npm install && npx prisma generate && npm run build && npx prisma migrate deploy` · Start: `node dist/server.js` · Root: `backend`

Both run on Node 20+. The backend uses Prisma / Postgres (`DATABASE_URL`); do
not set `MONGO_URI` — it is unused and ignored.

## What the build produces

`bun run build` (or `npm run build`) runs `vite build`. Output:

- `dist/client/` — hashed static assets (JS, CSS, images, fonts) for the browser.
- `dist/server/index.mjs` — SSR/server-fn handler bundled by Nitro.
- `dist/server/wrangler.json`, `.wrangler/` — Cloudflare Workers metadata (used by Lovable Publish / `wrangler deploy`).

The server bundle exports a Web `fetch` handler (`{ fetch(request, env, ctx) }`) — the same shape Cloudflare Workers expect.

## Two supported runtimes

### 1. Cloudflare Workers (Lovable Publish, default)

Use the Publish button in Lovable, or `npx wrangler deploy` from `dist/server/`. No extra config — this is the path the Lovable preview already uses.

### 2. Node.js (Render, MochaHost, Fly, plain VPS)

A Node entry is provided at `start.mjs` and exposed as `bun run start` / `npm start`. It:

- Imports `dist/server/index.mjs`.
- Serves `dist/client/**` as static files (long-cache for `/assets/*`).
- Adapts Node `req`/`res` to Web `Request`/`Response` and forwards everything else to the SSR handler.
- Binds to `process.env.PORT` (default `3000`) and `process.env.HOST` (default `0.0.0.0`).
- Handles `SIGTERM` / `SIGINT` for graceful shutdown.

Requires **Node.js 20+** (uses the built-in `fetch`, `Request`, `Response`, `Headers`, `URL`).

## Upmind production checklist (domain + hosting)

The TAKATAK code now handles Upmind failures gracefully (DAC widget falls
back to `POST /domain-requests`, hosting plan cards fall back to
`POST /hosting-requests`). **A 401 `Unrecognised domain name` or 404 product
response from Upmind is an Upmind dashboard config issue, not a code bug** —
work through this list inside the connected Upmind account:

### DAC / domain search (`upm-dac`)
- [ ] Authorize the live domain (`takatakca.lovable.app` and any custom domain, e.g. `takatak.ca`) under Upmind → Brand → Allowed origins / referrers.
- [ ] Authorize the staging domain (`id-preview--*.lovable.app`) so the preview widget works while iterating.
- [ ] Confirm `VITE_UPMIND_ORDER_CONFIG_URL` matches the brand's order config URL (currently `https://fimjpyw0mnzy.upmind.app/order/product`).
- [ ] Confirm `VITE_UPMIND_BRAND_ID` and `VITE_UPMIND_ACCOUNT_ID` belong to the same Upmind account that owns the order config URL.
- [ ] Enable DAC / domain search for the brand and verify TLDs `.ca`, `.com`, `.net`, `.org` are all enabled and priced.
- [ ] Verify CORS / referrer / domain restrictions inside Upmind allow the live domain.
- [ ] Confirm widget script URLs are current (`VITE_UPMIND_WIDGET_SCRIPT_URL`, `VITE_UPMIND_DAC_SCRIPT_URL`).

### Hosting widget (`upm-widget`)
The four product IDs configured (Portfolio / Bronze / Silver / Gold) must exist in the **same Upmind account** that owns the order config URL:

| Plan      | Product ID                              |
| --------- | --------------------------------------- |
| Portfolio | `61e50989-73d2-4752-053c-e45e610832d7`  |
| Bronze    | `1e96d298-537d-4e75-383b-14e120637085`  |
| Silver    | `80d1639e-237d-4395-3e2a-54610589e572`  |
| Gold      | `0381d780-e72d-4dd6-701c-8413569926e5`  |

- [ ] Verify each product ID resolves in Upmind admin (not 404).
- [ ] Each product is active, published, and orderable.
- [ ] All four products belong to the **same brand** as the order config URL.
- [ ] No product IDs come from a different Upmind account / sandbox.
- [ ] Override via `VITE_UPMIND_PLAN_PORTFOLIO` / `VITE_UPMIND_PLAN_BRONZE` / `VITE_UPMIND_PLAN_SILVER` / `VITE_UPMIND_PLAN_GOLD` if IDs change.

### What the code does while Upmind is misconfigured
- `/domain` — DAC widget renders if Upmind succeeds; otherwise the page swaps to the TAKATAK-managed domain request form (`POST /domain-requests`), saved to the `DomainRequest` table.
- `/hosting` — each plan card renders the Upmind product; on failure, each card swaps to a "Request this hosting plan" form (`POST /hosting-requests` → `HostingRequest` table).
- Admins can review incoming leads via `GET /admin/domain-requests` and `GET /admin/hosting-requests` (auth + admin role required).
- Local fallback: if the backend is unreachable, both forms persist the request to `localStorage` so nothing is lost.

#### Render (Web Service, runtime = Node)

- Build command: `npm install && npm run build`
- Start command: `node start.mjs`
- Environment:
  - `NODE_VERSION=20` (or newer)
  - `PORT` — set by Render, the script reads it.
  - any `VITE_*` build-time vars (must be set at build time, not start).
  - any server-side secrets used by `createServerFn` handlers (e.g. `LOVABLE_API_KEY`, `RENDER_API_BASE_URL`).

#### MochaHost / generic Node host

- After `npm run build`, deploy `dist/`, `start.mjs`, `package.json`, and `node_modules` (or run `npm ci --omit=dev` post-deploy).
- Run: `node start.mjs`.

#### Local smoke test

```
bun run build
PORT=3123 bun run start
# in another shell:
curl -I http://localhost:3123/
curl -I http://localhost:3123/marketplace
```

## Environment variables

Only set what the app actually uses; nothing in `start.mjs` requires secrets to boot.

| Var | Where | Purpose |
| --- | --- | --- |
| `PORT` | runtime | HTTP port for `start.mjs` (default `3000`) |
| `HOST` | runtime | Bind address (default `0.0.0.0`) |
| `RENDER_API_BASE_URL` | runtime | Backend base URL used by server functions |
| `LOVABLE_API_KEY` | runtime | AI Gateway auth (server-only) |
| `VITE_*` | build | Public client-side config (baked into `dist/client`) |

Never put server secrets behind a `VITE_` prefix — they would ship to the browser.

## Not deployed by this entry

- The Express backend in `backend/` deploys separately (`backend/render.yaml`, `backend/DEPLOYMENT.md`).
- `start.mjs` only serves the marketing/marketplace/dashboard frontend.

## Render Blueprint (one-shot)

The root `render.yaml` provisions everything in one shot: frontend web service,
backend web service, payout/notification/AI-intake workers, and a Postgres 16
database. From the Render dashboard: **New → Blueprint → point at this repo**.

## Manual Render setup (if not using the Blueprint)

- **Frontend service** — Root `/`, Build `npm install && npm run build`, Start
  `node start.mjs`, Health `/`.
- **Backend service** — Root `backend`, Build `npm install && npx prisma
  generate && npm run build && npx prisma migrate deploy`, Start `node
  dist/server.js`, Health `/health`.
- **Workers** (Root `backend`, Build same as backend):
  - payout: `node dist/workers/payoutSweepWorker.js`
  - notifications: `node dist/workers/notificationWorker.js`
  - AI intake: `node dist/workers/aiIntakeWorker.js`
- **Postgres** — Render Postgres 16; wire `DATABASE_URL` into backend + workers.

### Required backend env (production)

`DATABASE_URL`, `AUTH_ISSUER`, `CORS_ORIGINS`, plus either
`AUTH_PRIVATE_KEY` + `AUTH_PUBLIC_KEY` (preferred RS256) or a strong
`AUTH_JWT_SECRET` (≥32 chars). Server refuses to boot in production if these
are missing — see `backend/src/config/env.ts`.

### Optional integrations (warn only)

OTP: `SENDGRID_API_KEY` + `SENDER_EMAIL`, `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_VERIFY_SERVICE_SID`.
Upmind: `UPMIND_API_KEY`, `UPMIND_BRAND_ID`, `UPMIND_SESSION_SECRET`.
Payments: `PAYMENT_PROVIDER=stripe`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
Payouts (Stripe Connect): `PAYOUT_PROVIDER=stripe`, `STRIPE_CONNECT_ENABLED=true`, `STRIPE_CONNECT_CLIENT_ID`, `STRIPE_CONNECT_WEBHOOK_SECRET`.

### Rotating JWT keys

Generate a fresh RSA keypair (never reuse the legacy committed `keys/private.pem`):

```
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

Paste into Render env as `AUTH_PRIVATE_KEY` / `AUTH_PUBLIC_KEY` (escape newlines as `\n` if needed). The JWKS endpoint at `/auth/well-known/jwks.json` exposes the public key automatically.

## Smoke test

```
FRONTEND_URL=https://takatak.ca \
BACKEND_URL=https://api.takatak.ca \
./scripts/render-smoke-test.sh
```

Fails on any 5xx or connection error. Set `ALLOW_PROD_TEST_USER=true` + `TEST_AUTH_TOKEN=...` to also hit `/user/dashboard` and `/promotions/me`.

## Identifying a wrong (legacy) deployment

If Render logs show `node index.js` or `querySrv ENOTFOUND ...mongodb...`,
the service is running the old MongoDB backend. This repo has no `index.js`,
no Mongo, and no `MONGO_URI`. Fix the service's Build/Start commands (see
above) or recreate from the Blueprint.