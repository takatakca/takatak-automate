# TAKATAK — Architectural decisions

## 2026-10-14 — Preserve source of truth

- Repository `takatakca/takatak-automate` / `main` is the active codebase. Never replace it with `takatakca/takatakbackend` or recreate from scratch.
- Keep `BRAND.md` visual rules: electric blue over deep navy, GROUPE TAKATAK identity. Maintain separate experiences for vertical apps.
- Tenant-owned data must be isolated server-side; identities and per-product entitlements are centralized through TAKATAK, not duplicated per merchant.

## 2026-10-14 — Deployment safety

- Use new `takatak-frontend` Render service rather than change the legacy `takatak` instance. The live domain stays untouched until verified readiness.
- Set Node 22 for frontend builds. Include build-only devDependencies even when Render runtime has `NODE_ENV=production`. Keep Vite 8 compatible with the installed TanStack Start range; do not use npm peer-dependency bypass flags by default.
- Prefer immutable provider-confirmed payment/payout states and signed webhooks; stop unsupported flows with explicit failure rather than simulated success.
- Never create billable production infrastructure or claim completion without verifying real provider settings and health checks.
