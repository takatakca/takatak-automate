# TAKATAK Automation Backend Contract (Step 1)

This document defines what the TAKATAK Render backend MUST expose so the
frontend (this TanStack Start app) can drive the full automation lifecycle.
The frontend never talks to Render directly — every call is proxied through
`src/lib/render-proxy.functions.ts` (`proxyRender`).

## Auth (already live)
- `POST /auth/register` — body: `{ firstName, lastName, email, phone, password, ... }`
- `POST /auth/login` — body: `{ email|username|phone, password }`
- `POST /auth/verify-otp` — body: `{ email|phone, code }`
- `POST /auth/resend-code` — body: `{ email|phone }`
- `POST /auth/logout`
- `GET  /user/dashboard` — returns `{ user, orders, invoices, activity }`

## Service instances (to implement)
- `GET  /services/instances` → `ServiceInstance[]`
- `GET  /services/instances/:id` → `ServiceInstance`
- `POST /services/instances` → create draft from `{ serviceKey, meta }`
- `PATCH /services/instances/:id` → update meta / state transition

```
ServiceInstance {
  id: string
  userId: string
  serviceKey: string            // matches src/lib/services.ts keys
  state: ServiceState           // see src/lib/automationStates.ts
  upmindOrderId?: string
  upmindServiceId?: string
  externalPortalUrl?: string
  intakeId?: string
  meta: Record<string, unknown>
  createdAt: ISO8601
  updatedAt: ISO8601
}
```

## Orders
- `POST /orders` — `{ items: [{ serviceKey, qty, options }] }` → `{ orderId, checkoutUrl? }`
- `GET  /orders/:id`

## Automation jobs
- `GET  /automation/jobs?instanceId=...`
- `POST /automation/jobs/:id/retry`
- Webhook in: `POST /api/public/webhooks/automation` (signed)

## AI intake
- `POST /ai/intake/start` — `{ serviceKey, answers }` → `{ intakeId, brief }`
- `GET  /ai/intake/:id`
- `POST /ai/intake/:id/finalize`

## Marketplace
- `GET  /marketplace/gigs?category=...`
- `GET  /marketplace/gigs/:id`
- `POST /marketplace/projects` — `{ title, brief, budget, category }`
- `GET  /marketplace/freelancers/:id`

## Upmind sync (webhooks → backend, surfaced to frontend via instance state)
- `POST /api/public/webhooks/upmind` (signed)
  - `order.paid` → state: `paid` → enqueue provisioning
  - `service.active` → state: `active`
  - `service.suspended` → state: `failed`

## External portals (single sign-on launch)
- `POST /integrations/launch` — `{ serviceKey }` → `{ launchUrl }` (signed, single-use)

## Admin exceptions (Step 2 build)
- `GET  /admin/exceptions` — instances in `failed` / `waiting_for_takatak`
- `POST /admin/exceptions/:id/resolve`

## Environment variables

Server (Render proxy):
- `RENDER_API_BASE_URL` (default `https://takatak.onrender.com`)
- `SOCIAL_PORTAL_URL`, `VOIP_PORTAL_URL`, `LEADS_PORTAL_URL`,
  `LOCAL_LISTINGS_PORTAL_URL`, `MARKETING_PORTAL_URL`, `MARKETPLACE_PORTAL_URL`
  — fallback launch URLs when `/integrations/launch` is not yet live.

Client (Upmind widgets only):
- `VITE_UPMIND_ORDER_CONFIG_URL`
- `VITE_UPMIND_WIDGET_SCRIPT_URL`
- `VITE_UPMIND_DAC_SCRIPT_URL`
- `VITE_UPMIND_CURRENCY` (default `CAD`)