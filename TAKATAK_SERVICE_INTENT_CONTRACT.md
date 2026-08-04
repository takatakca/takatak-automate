# TAKATAK Service Intent Contract — Public Sales Layer ↔ Dashboard Repo

## Scope and honest status

This repository is the **public TAKATAK sales app** (TanStack Start, OTP/token
auth, Express/Prisma service backend). It is **not** the dashboard.

The TAKATAK dashboard is a **separate Next.js 16 App Router project** using
Supabase cookie auth, Prisma/PostgreSQL, `Client` / `ClientMembership` /
`BusinessBrand` / `BusinessLocation` tenant isolation, workspace permission
guards, and pnpm. That repo is not present in this workspace, so nothing in
this repo may be described as "connected to the dashboard backend".

What lives here is labelled: **Public TAKATAK service intent layer**.
What must be built there: **Dashboard Service Intent Receiver —
Supabase/Prisma version**.

## Shared shape

`src/lib/serviceIntentContract.ts` in this repo is the authoritative shape.
Mirror it verbatim in the dashboard repo at
`src/lib/service-intents/service-intent-contract.ts`.

```ts
type PublicServiceIntent = {
  serviceKey: string;
  publicLabel: string;
  internalServiceType:
    | "domain" | "web_hosting" | "social_media" | "local_listings"
    | "leads" | "ai_studio" | "reports" | "billing" | "support" | "custom";
  planKey?: string;
  packageKey?: string;
  priceCents?: number;
  currency: "CAD";
  billingType?: "one_time" | "monthly" | "yearly" | "per_lead" | "custom";
  query?: string;
  domain?: string;
  language: "en" | "fr";
  sourcePage?: string;
  nextDashboardPath: string;
  createdAt: string;
  expiresAt: string; // createdAt + 6h
};
```

## Cross-domain rule

The public site and dashboard are assumed to be **different origins**.
`sessionStorage` therefore cannot carry intent across the boundary.

Required pattern:

1. Public CTA builds a `PublicServiceIntent`.
2. Public site redirects to
   `https://<dashboard>/login?next=/dashboard/start&intent=<encoded>`.
3. Dashboard authenticates via Supabase cookie auth.
4. Dashboard validates and **claims** the intent server-side.
5. `ServiceInstance` is created **only after** workspace/brand/location context
   is resolved.

The base64 encoder in `serviceIntentContract.ts` is transport only. Before
production, replace it with either an HMAC-signed payload or a short-lived
server-stored intent ID. The dashboard must never trust an unsigned payload
for anything beyond pre-filling the start screen.

## Route map (must be validated against real dashboard routes)

| internalServiceType | nextDashboardPath          |
| ------------------- | -------------------------- |
| domain              | `/dashboard/web-hosting`   |
| web_hosting         | `/dashboard/web-hosting`   |
| social_media        | `/dashboard/social`        |
| local_listings      | `/dashboard/local-listings`|
| leads               | `/dashboard/leads`         |
| ai_studio           | `/dashboard/ai-studio`     |
| reports             | `/dashboard/reports`       |
| billing / support   | `/dashboard/support`       |
| anything unmapped   | `/dashboard/start` or `/dashboard/services` |

Do not invent `/dashboard/domains` or `/dashboard/hosting` unless those routes
actually exist in the dashboard repo. Unknown paths must fall back to
`/dashboard/start`.

## Dashboard receiver requirements

Files to create in the dashboard repo:

- `src/lib/service-intents/service-intent-contract.ts` (mirror of this shape)
- `src/lib/service-intents/service-intent-map.ts`
- `src/lib/service-intents/service-intent-validation.ts`
- `src/lib/service-intents/service-intent-service.ts`
- `src/app/api/service-intents/route.ts`
- `src/app/dashboard/start/page.tsx`

Behaviour, using dashboard patterns only (`getSessionUser`,
`requireWorkspacePermission`, `requireWorkspaceApiPermission`, `readJsonBody`,
`jsonResponse`, `handleApiError`, Prisma, audit logs, pnpm):

1. Read the incoming intent; reject malformed, unknown `serviceKey`, expired,
   or disallowed `nextDashboardPath`.
2. Require an authenticated Supabase session (cookie auth — never the public
   site's OTP/token auth).
3. Resolve workspace access; prompt to select/create a workspace when absent.
4. Prompt to select/create brand/location when the module requires it.
5. Create a `planned` `ServiceInstance` only once tenant context is valid, and
   only within the caller's own workspace.
6. Redirect to the resolved dashboard module.
7. Write an audit log entry for claim + creation.
8. Never expose provider secrets; never mark a provider "connected" without a
   successful real provider call. Social stays native TAKATAK — Metricool is
   not the runtime engine.

## Public copy rule

Public pages say TAKATAK Domains / Hosting / Social / Leads / Automation.
Provider names (Upmind, Metricool), Supabase, Prisma, and adapter internals are
dashboard/admin-only vocabulary.

## Required tests in the dashboard repo

```
pnpm db:generate
pnpm typecheck
pnpm exec eslint . --max-warnings=0
pnpm build
```

Browser flows: logged-out visitor selects TAKATAK Hosting (intent survives
login, no ServiceInstance before workspace context); logged-in client selects
TAKATAK Social (permission checked, no fake provider connection); French flow;
security (workspace A cannot claim workspace B's intent, invalid `serviceKey`
rejected, expired intent rejected, invalid next path rejected, no provider
secret in the browser).