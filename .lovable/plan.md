
# TAKATAK Marketplace + AI Search Phase

Scope is large. I'll deliver it in one coordinated pass: frontend menu cleanup + marketplace UX + AI search + project/freelancer dashboards, and backend Prisma models + Express endpoint scaffolds wired to the existing contract. No real payment processor integration (documented as remaining work).

## 1. Menu cleanup (frontend)

- Edit `src/components/layout/SiteHeader.tsx` (and any nav config): remove Cuba Travel, Dating, Property Management. Ensure these links exist: Today's Deals, Domains, Hosting, Websites, Mobile Apps, Local Listings/QMAPS, Lead Generation/FLEXS, VoIP, Marketing, Social Media, AI Business Tools, Service Marketplace, Dashboard.
- Add `/deals` route stub if missing.

## 2. Global AI search

- New `src/components/search/GlobalSearchBar.tsx` mounted in `SiteHeader`: input + category dropdown + autocomplete from a local catalog (`src/lib/searchCatalog.ts`) that indexes domains, hosting, websites, mobile apps, QMAPS, FLEXS, VoIP, AI tools, marketplace categories, freelancer services.
- New route `/search` (`src/routes/search.tsx`): reads `?q=&category=`, calls `GET /search` via proxy with local-catalog fallback, routes domain queries to `/domain`, hosting to `/hosting`, freelancer/custom to `/marketplace/post-project`, otherwise displays grouped results.
- New `src/lib/search.ts` typed client (`apiGet("/search", {q, category})`).

## 3. AI Service Advisor

- New `src/components/ai/ServiceAdvisor.tsx`: textarea + "Get recommendations". Calls server fn `aiServiceAdvisor` (new `src/lib/advisor.functions.ts`) which proxies `POST /ai/service-advisor`. On failure, fallback uses local catalog keyword matching to recommend services + next-step CTAs (start intake / checkout / post project).
- Mount advisor on `/search` and on homepage marketplace section.

## 4. Homepage marketplace section + Marketplace UX

- Edit `src/routes/index.tsx` to add a "Get business work done through TAKATAK" section near the bottom with category grid (17 categories from `MARKETPLACE_CATEGORIES`) + advisor + CTA to `/marketplace`.
- New `src/routes/marketplace.tsx`: hero, big search, category chips, popular packages grid (from `GET /marketplace/packages`), CTA to post project.
- `src/routes/marketplace.search.tsx` → reuses `/search` with category preset.
- `src/routes/marketplace.category.$slug.tsx` → lists packages filtered by category.
- `src/routes/marketplace.gigs.$id.tsx` → package detail + "Order" CTA → starts a ClientProject (paid flow placeholder).
- `src/routes/marketplace.post-project.tsx` → form (title, brief, category, budget, files placeholder) → `POST /marketplace/projects`.
- Update `src/routes/services.marketplace.tsx` to route into `/marketplace`.

## 5. Dashboard additions

- New routes (all use `DashboardShell`):
  - `dashboard/marketplace.projects.tsx`, `dashboard/marketplace.messages.tsx`, `dashboard/marketplace.deliveries.tsx`
  - `dashboard/projects.$projectId.tsx` — project workstation: brief, milestones list, files, messages, deliveries, status timeline, approve/request-revision/dispute buttons
  - `dashboard/freelancer.tsx`, `dashboard/freelancer.contracts.tsx`, `dashboard/freelancer.contracts.$contractId.tsx`, `dashboard/freelancer.deliveries.tsx`, `dashboard/freelancer.payouts.tsx`
- Update `src/routes/dashboard.marketplace.tsx` to add tabs linking to subpages.
- Update `src/routes/dashboard.index.tsx` to surface marketplace projects, pending approvals, deliveries needing review, freelancer status, payout release status (uses `GET /user/services` + `GET /marketplace/projects` + `GET /freelancers/contracts`).

## 6. Frontend typed clients

- `src/lib/marketplace.ts` — categories, packages, projects (list/get/create), files/messages/milestones/deliveries, approve/revision/dispute.
- `src/lib/freelancer.ts` — apply, me, contracts, accept/decline, messages, deliveries, payouts.
- `src/lib/payments.ts` — payment release state enum + helpers.

## 7. Backend (Prisma + Express)

Add to `backend/prisma/schema.prisma`:

- Enum `PaymentReleaseState`: unpaid, paid_to_takatak, assigned, accepted_by_freelancer, in_progress, submitted, revision_requested, approved, grace_period, released, disputed, cancelled, refunded.
- Enum `ContractStatus`, `ProjectStatus`, `MilestoneStatus`.
- Models: `MarketplaceCategory`, `MarketplacePackage`, `ClientProject`, `ProjectFile`, `ProjectMessage`, `ProjectMilestone`, `ProjectDelivery`, `FreelancerApplication`, extend `FreelancerProfile`, `FreelancerContract`, `ContractAssignment`, `PayoutHold`, `PayoutRelease`, `DisputeCase`, `ProjectAuditLog`.
- Replace existing simple `MarketplaceGig`/`MarketplaceProject` with the new models (keep `MarketplaceGig` as alias for packages for backward compatibility or remove and update routes).

New routers:

- `backend/src/routes/search.ts` — `GET /search`, `POST /ai/service-advisor` (uses `aiBriefGenerator`-style call with template fallback).
- `backend/src/routes/projects.ts` — marketplace project CRUD + files/messages/milestones/deliveries/approve/request-revision/dispute.
- `backend/src/routes/freelancers.ts` — apply/me/contracts/accept/decline/messages/deliveries/payouts.
- Extend `backend/src/routes/admin.ts` — projects list/get/assign/approve-delivery/request-revision/start-grace-period/release-payment/dispute + freelancer-applications approve/reject.
- Update `backend/src/routes/marketplace.ts` — packages endpoints (replace gigs internally but keep `GET /marketplace/gigs` as alias if reasonable).
- Mount new routers in `backend/src/server.ts` with rate limits where appropriate.

State machine extension in `backend/src/services/stateMachine.ts` for `PaymentReleaseState` transitions.

File uploads: document contract in `backend/README.md` — multipart not implemented; placeholder endpoints accept metadata + URL, with signed-URL TODO note. Authorization: client only own projects, freelancer only assigned, admin all.

## 8. Build & verify

- `cd backend && npx prisma generate && npm run build`
- Frontend build runs automatically.
- Fix any TS errors.

## 9. Final report

Summarize: files changed, menu cleanup, AI search, marketplace routes, workflows, payment release states, workstation, backend models/endpoints, file-upload notes, build result, remaining work (real file storage with signed URLs, real payment processor integration, real AI gateway responses for advisor, freelancer onboarding KYC, escrow ledger).

