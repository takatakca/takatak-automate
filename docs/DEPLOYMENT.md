# TAKATAK — Verified deployment runbook

Current facts as of 2026-10-14. See also `../DEPLOYMENT.md`, `../render.yaml` and `backend/DEPLOYMENT.md`.

## Real Render target

- Confirmed workspace: `My Workspace`, id `tea-d04kpsali9vc73eskv8g`.
- Frontend web service `takatak-frontend`, id `srv-db7skt6i0phs73agt8n0`, URL `https://takatak-frontend.onrender.com`, source `https://github.com/takatakca/takatak-automate`, branch `main`, auto deploy: yes.
- Current service build command is `npm install --no-audit --no-fund && npm run build`; repo `.npmrc` must include `include=dev` so build plugins install even with `NODE_ENV=production`. Node: 22. Start: `node start.mjs`.
- Successful build alone is insufficient: check Render deployment status, `/healthz` JSON 200, then a real SSR page and assets. Verify deploy SHA matches GitHub `main`.
- The legacy Render `takatak` service tracks another repository and must not be assumed to serve the new frontend.

## Full system — NOT YET LIVE

Blueprint `../render.yaml` describes frontend, backend, three workers, Postgres; it has **not** been instantiated in full. The Render workspace showed no Postgres instances. Do not activate payments, payouts or domain migration before secrets, schema and live readiness are proven.

For backend, working root `backend/`, command `npm install && npx prisma generate && npm run build && npx prisma migrate deploy`, entry `node dist/server.js`. Backend needs PostgreSQL `DATABASE_URL`, `AUTH_ISSUER`, `CORS_ORIGINS`, and RS256 key pair or strong `AUTH_JWT_SECRET`. Keep all these out of Git. Set frontend server-side `RENDER_API_BASE_URL` to *actual* backend URL, not the unrelated legacy service.

Do not treat `GET /health` alone as a database check: use `GET /ready`. Do not call a deployment successful until public health endpoints and the Render deployed commit are verified.

## Recovery

Read Render build/runtime logs. If npm ERESOLVE mentions Vite 7 and TanStack Start 1.169+, align Vite to 8 as in `package.json`. If Vite config cannot find `@lovable.dev/vite-tanstack-config`, confirm devDependencies installed (`include=dev` via `.npmrc`). Avoid `--force` and `--legacy-peer-deps` as routine fixes. Do not redeploy the legacy `takatakbackend` service for this app.

## Backend build dependency safeguard

Backend and workers compile with Prisma/TypeScript in `devDependencies`. Use `npm ci --include=dev --no-audit --no-fund && npx prisma generate && npm run build` inside `backend/`; the API additionally runs `npx prisma migrate deploy` before startup. Root `.npmrc` does not reliably cover a separate Render `rootDir: backend`, so `backend/.npmrc` also has `include=dev`. GitHub Actions backend job on `6c9c035` passed `npm ci`, Prisma generation and TypeScript validation.

Before provisioning real PostgreSQL, verify the chosen database plan and retention/backups. A disposable free database is not an acceptable long-lived customer production database. All secrets must be set in Render's secret store, not `render.yaml` or commits.

## Release discrepancy (2026-10-14 19:34 UTC)

GitHub Actions `38624516272` for `098cc176` passes frontend SSR HTTP health+homepage and backend typecheck. Render deploy `dep-db7t8cdbedkc73eq3smg` (old SHA `85c0c02`) remains `build_in_progress` long after its successful build upload; no runtime response or newer SHA in Render deploy history. Do not interpret `Build successful` as deployment. Check [Render service dashboard](https://dashboard.render.com/web/srv-db7skt6i0phs73agt8n0) for build queue, resource availability or maintenance notices, and contact provider support if the stale deployment cannot be advanced. Once it progresses, check commit SHA and publicly fetch `/healthz` and `/`. Keep the old service and production domain untouched during recovery.
