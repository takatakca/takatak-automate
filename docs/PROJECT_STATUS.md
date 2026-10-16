# TAKATAK — Project status

Updated: 2026-10-14. Canonical repository: `takatakca/takatak-automate`, branch `main`. Read `../AGENTS.md`, `../WORKLOG.md`, and `AGENT_HANDOFF.md` before new work.

## Verified

- React 19 / TanStack Start frontend; Node entry `start.mjs`, liveness `GET /healthz`.
- Express/Prisma backend in `backend/`; health `GET /health`, database readiness `GET /ready`. PostgreSQL is the intended database, **not MongoDB**.
- Render workspace `My Workspace` (id `tea-d04kpsali9vc73eskv8g`) has service `takatak-frontend` (`srv-db7skt6i0phs73agt8n0`), GitHub `main`, auto deploy enabled, URL `https://takatak-frontend.onrender.com`.
- Render legacy service `takatak` (`srv-d3dpn73uibrs73a8afqg`) uses DIFFERENT repo `takatakca/takatakbackend`; do **not** change it while migrating.
- Render workspace contained no Postgres instance during 2026-10-14 inspection. New frontend is not equivalent to full production readiness.
- Render deploy 1 (`8264e3f`) failed npm peer dependency Vite 7/TanStack Start. Deploy 2 (`1da134b`) installed packages but lacked `@lovable.dev/vite-tanstack-config` at build time because production npm installs omit devDependencies. Root `.npmrc` now explicitly includes dev dependencies.
- No open GitHub issues/PRs or workflow runs during 2026-10-14 inspection.

## Not complete

Backend and workers are not attached to current repo on Render; no Postgres, verified production auth, payment/OTP integrations, real object storage, or provider-confirmed freelancer payouts. Any account/checkout demo must not be presented as verified live. Live `takatak.ca` DNS currently not switched as part of this work.

## Security constraints

- TAKATAK is central identity authority; data access across client companies must be tenant-scoped and checked server-side. Vertical app entitlements must be enforced; never merge unrelated app dashboards automatically.
- Reject unverified webhook requests; never hardcode credentials; never mark a Stripe payment or freelancer payout successful absent processor confirmation.

- Frontend API proxy fails closed when `RENDER_API_BASE_URL` is missing or unsafe, avoiding cross-project token forwarding to the unrelated legacy Render backend.

## CI/Render cross-check — 2026-10-14 19:34 UTC

- CI run [38624516272](https://github.com/takatakca/takatak-automate/actions/runs/38624516272) for `098cc176`: backend Prisma/typecheck **pass**, frontend Vite build/Node runtime smoke on `/healthz` and `/` **pass**. Previous TanStack Start `.inputValidator()` removal failure now resolved with `.validator()`.
- Render service `srv-db7skt6i0phs73agt8n0` still has latest deploy `dep-db7t8cdbedkc73eq3smg` from `85c0c02` in `build_in_progress` >20min after build log says successful; no server-ready proof or deployment events newer than 19:12 UTC, and public HTTP endpoints inaccessible. This is a **release blocker** despite successful CI.

## Verified state on 2026-10-16

The correct Render frontend service successfully deployed `5d8a983` and served a Node process on port 10000 according to provider logs. No external HTTP result could be independently obtained in this environment, and `takatak.ca` remains under its existing independent production arrangement. GitHub Actions 38625048871 passed; the newest security commits are pending their own CI and Render results. This repo is **not complete**, because the actual backend, DB, OTP, payment and storage dependencies are unverified. Security changes now restrict private mediator messages, remove a duplicate admin assignment route, guard project states and validate service catalog keys.
