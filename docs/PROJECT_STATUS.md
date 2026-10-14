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
