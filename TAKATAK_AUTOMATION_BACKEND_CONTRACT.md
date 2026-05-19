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

## Concrete request/response examples

All endpoints below are called by the frontend via `proxyRender` (server-side).
The browser never calls Render directly. Bearer token is forwarded automatically.

### GET /user/services
Response 200:
```json
{
  "services": [
    {
      "id": "si_01HXY...",
      "userId": "usr_01HXY...",
      "serviceKey": "websites",
      "state": "ai_processing",
      "upmindOrderId": null,
      "intakeId": "intk_01HXY...",
      "meta": { "projectName": "Acme site" },
      "createdAt": "2026-05-10T12:00:00Z",
      "updatedAt": "2026-05-12T08:30:00Z"
    }
  ]
}
```

### POST /services/start
Request:
```json
{ "serviceKey": "local_listings", "options": { "plan": "pro" } }
```
Response 200:
```json
{
  "instance": { "id": "si_...", "serviceKey": "local_listings", "state": "intake_required", "userId": "usr_..." },
  "checkoutUrl": "https://billing.takatak.ca/checkout/abc",
  "intakeId": "intk_..."
}
```
`checkoutUrl` and `intakeId` are optional. Frontend behavior:
1. If `checkoutUrl` present → `window.location.href = checkoutUrl`.
2. Otherwise navigate to the service's dashboard route.

### GET /services/instances/:id/timeline
Response 200:
```json
{
  "events": [
    { "id": "evt_1", "state": "paid",                "label": "Payment confirmed", "at": "2026-05-10T12:01:00Z", "actor": "system" },
    { "id": "evt_2", "state": "provisioning_queued", "label": "Queued",            "at": "2026-05-10T12:01:05Z", "actor": "system" },
    { "id": "evt_3", "state": "intake_required",    "label": "Awaiting client",   "at": "2026-05-10T12:02:00Z", "actor": "system" }
  ]
}
```

### POST /integrations/launch
Request:
```json
{ "serviceKey": "qmaps" }
```
Response 200:
```json
{ "launchUrl": "https://qmaps.example.com/sso?token=...&expires=..." }
```
The URL MUST be single-use and short-lived. If the endpoint returns non-2xx
or no `launchUrl`, the frontend falls back to the public env URL
(`<SERVICE>_PORTAL_URL`). If neither is available, the user sees
"portal not configured yet".

### POST /ai/intake/start
Request:
```json
{
  "serviceKey": "websites",
  "answers": {
    "businessName": "Acme",
    "industry": "Real estate",
    "goals": "More leads"
  }
}
```
Response 200:
```json
{ "intakeId": "intk_...", "brief": "AI-generated project brief..." }
```
If the backend is unreachable, the frontend keeps the answers in
`localStorage` and shows a fallback confirmation message.

## Developer test notes (frontend)

| Scenario | How to test |
|---|---|
| Dashboard empty state | Backend returns `{ "services": [] }` for `GET /user/services`. |
| Dashboard with backend data | Backend returns 1+ instances with valid `state` values from `src/lib/automationStates.ts`. |
| QMAPS launch fallback | Have backend return 404/500 on `/integrations/launch`. Set `QMAPS_PORTAL_URL` server env. Button opens the env URL. |
| FLEXS launch fallback | Same as above with `FLEXS_PORTAL_URL`. |
| AI intake fallback | Backend returns non-2xx on `/ai/intake/start`. Wizard shows "saved locally" message; answers persist in `localStorage`. |
| Start service flow | `POST /services/start` returns `checkoutUrl` → browser redirects. Returning only `instance` → user lands on dashboard route. |
| Protected dashboard routes | Visit `/dashboard/*` while signed out → redirected to `/login` by `<ProtectedRoute>` in `DashboardShell`. |

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