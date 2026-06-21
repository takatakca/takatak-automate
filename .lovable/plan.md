# TAKATAK Real Marketplace Operation Phase — Plan

This is a large, multi-area change. I'll execute it in 6 ordered passes, each leaving the project build-green before moving on. No fake paid states, no fake payouts, no copyrighted assets.

## Pass 1 — Backend endpoint completeness audit

Audit existing routes and add only what's missing. Expected gaps based on current files:

- `POST /marketplace/packages/:id/checkout` — create order in `unpaid` / `checkout_not_configured` state, link to package + tier + add-ons. No fake `paid_to_takatak`.
- `POST /marketplace/projects/:id/files` — wraps existing `/files/sign` + records metadata row.
- `GET /orders`, `GET /orders/:id`, `GET /orders/:id/status` — verify present in `routes/orders.ts`, add if missing.
- Freelancer: `POST /freelancers/apply`, `GET /freelancers/me`, `GET /freelancers/contracts`, `GET/POST contracts/:id`, `accept`, `decline`, `messages`, `deliveries`, `GET /freelancers/payouts`.
- Admin: `GET /admin/projects`, `GET /admin/projects/:id`, `approve-delivery`, `request-revision`, `start-grace-period`, `release-payment` (gated → `release_ready` when provider missing), `dispute`, `GET /admin/exceptions`, `GET /admin/payouts`.
- Notifications: verify `GET /notifications`, `POST /:id/read`, `POST /read-all`.

Reuse existing services (`payouts.ts`, `payoutProvider.ts`, `stateMachine.ts`). No schema changes unless strictly required; if a field is needed (e.g. `order.tier`, `order.addOns`), add via Prisma migration with GRANTs.

## Pass 2 — Dev-only demo seed

Add `backend/prisma/seed.demo.ts` guarded by `SEED_DEMO_MARKETPLACE=true` AND `NODE_ENV!=='production'`. Seeds: demo client, demo freelancer, demo project, assigned contract, messages, milestones, delivery, notification. Wired via new npm script `prisma:seed:demo`. Production-safe (early-exit otherwise).

## Pass 3 — Realistic visual asset system

New files:

- `src/lib/serviceVisuals.ts` — map `serviceKey` → `{ cover, gallery[], category, altText, fallbackBg }`.
- `src/components/marketplace/ServiceImage.tsx` — large responsive image with realistic SVG/CSS mockup fallback (browser chrome, app frame, dashboard frame), professional alt text, lazy load.
- `src/components/marketplace/ServiceGallery.tsx` — thumbnail strip + large preview, keyboard accessible.
- `src/components/marketplace/visuals/` — pure CSS/SVG mockup components (BrowserMockup, PhoneMockup, DashboardMockup, LogoBoardMockup, SocialGridMockup, CRMMockup, MenuFlyerMockup, WorkflowMockup, AIToolsMockup, VoIPMockup, SpreadsheetMockup, EcomMockup). All hand-built SVG — no external image hotlinks, no Fiverr assets.

Replace `ServiceThumbnail` usage on:
- `MarketplacePackageCard`, `PackageResultCard`, `GigCard`, `FeaturedServicesStrip`
- `marketplace.gigs.$id.tsx` — gallery strip + large preview
- `marketplace.category.$slug.tsx` — bigger image area

Mobile: aspect-ratio + `object-cover`, no fixed widths.

## Pass 4 — Operational buyer/quote/workroom flows

### Buyer package flow
- `marketplace.gigs.$id.tsx`: add Basic/Standard/Premium tier picker (from package or synthetic tiers), add-on checkboxes, total CAD, "Continue" → calls `POST /marketplace/packages/:id/checkout`.
- On success: route to `/dashboard/orders` showing the order. If provider missing, order persists with state `checkout_not_configured` and message "Saved — checkout not configured yet."
- Never display `paid_to_takatak` unless backend returned it from a verified webhook.

### Buyer quote flow
- "Request Quote" CTA → `/marketplace/post-project?packageId=&category=` prefilled.
- Submit → `POST /marketplace/projects` → redirect to `/dashboard/projects/:projectId`.

### Workroom — `/dashboard/projects/:projectId`
Audit existing route and ensure it renders:
brief, tier, payment status badge, mediator status, milestones, messages, files, delivery list, revision form, approve button, dispute button, audit timeline, "Next action" call-out. Wire to existing endpoints.

### Admin
Verify `dashboard.admin.projects.tsx`, `…$id.tsx`, `exceptions`, `payouts` show real data and expose: assign freelancer modal, approve, request revision, start grace, release-payment (which calls `release_ready` when provider unset), dispute.

### Freelancer
Verify routes show assigned contracts only, accept/decline, message, upload delivery, payouts list. Hide client billing fields server-side and in UI.

## Pass 5 — Frontend data fetch with fallback

For each listed page:
- try backend (`apiGet`) first
- public catalog pages fall back to static `marketplacePackages` / `marketplaceCategories`
- dashboard / workroom / admin / freelancer pages show empty/error states — NEVER fall back to fake data

Add a tiny `useApiWithFallback` helper where useful, otherwise inline in each loader.

## Pass 6 — Verification

Run in order:
1. `cd backend && npx prisma generate`
2. `cd backend && npm run typecheck`
3. `cd backend && npm run build`
4. `bun run build` (frontend)
5. Smoke script syntax check.
6. Manual route walk-through via `code--view` of each affected route confirming wiring.

Cannot execute live end-to-end clicks without a running deployed backend; will document each acceptance test's code-level evidence (which handler is called, which state is set) rather than fabricate "live PASS" results.

## Technical details

- **No schema changes** unless `Order` lacks `tier` / `addOns` fields. If needed: add `tier String?` and `addOns String[]` with migration + GRANTs already covered by existing table grants.
- **Checkout endpoint** returns `{ order, paymentRequired: boolean, providerConfigured: boolean }`. Frontend uses these flags — never invents `paid_to_takatak`.
- **Release-payment endpoint** delegates to `payoutProvider.release()`; if provider unconfigured, sets contract.paymentState=`release_ready` and writes audit log — never `released`.
- **Visuals**: all SVG/CSS components live in `src/components/marketplace/visuals/`. No network image fetches. Each mockup ~80–150 lines of hand-rolled SVG simulating product UI (browser frame with site, dashboard with charts, etc.).
- **Seed safety**: `seed.demo.ts` guards with `if (process.env.NODE_ENV === 'production' || process.env.SEED_DEMO_MARKETPLACE !== 'true') { console.log('skip'); process.exit(0); }`.

## Files (estimated)

Created (~20): checkout route, freelancer routes (if missing), admin route gaps, `seed.demo.ts`, `serviceVisuals.ts`, `ServiceImage.tsx`, `ServiceGallery.tsx`, 12 mockup components, dev seed script entry.

Modified (~15): existing marketplace routes/components to use new visuals, `marketplace.gigs.$id.tsx` (tier/add-on/Continue), `marketplace.post-project.tsx` (prefill), workroom enhancements, dashboard pages to fetch backend with fallback.

## Out of scope (explicit)

- Real Stripe checkout completion — still requires live Stripe config.
- Real payout release — still requires live payout provider config.
- Live deployed smoke run — requires user to provide Render URL.
- Any UI refactor outside marketplace surfaces.
- Brand/copy redesign.

## Estimated risk

Medium-high — touches many surfaces. Mitigated by doing each pass with a build check before the next. If any pass breaks the build, I stop and fix before continuing.

---

Please confirm to proceed, or tell me which passes to skip / reorder.