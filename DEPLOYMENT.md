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