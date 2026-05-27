# TAKATAK Marketplace — Order & Payment Contract

This document is the source of truth for the order/payment surface between
the TAKATAK frontend and the backend. All payment processor secrets stay on
the backend; the browser only ever receives a `checkoutUrl` (or `null`).

## Endpoints

### `POST /marketplace/packages/:id/checkout` (auth)
Body:
```json
{
  "packageId": "website-starter",
  "title": "Business website — up to 5 pages",
  "category": "website_design",
  "tier": { "name": "Standard", "priceCents": 54900, "deliveryDays": 10 },
  "addons": [{ "label": "Logo design", "priceCents": 9900 }],
  "quantity": 1,
  "currency": "CAD"
}
```
Response:
```json
{
  "orderId": "ord_...",
  "serviceInstanceId": "svc_...",
  "paymentStatus": "unpaid",
  "currency": "CAD",
  "totalCents": 64800,
  "checkoutUrl": null
}
```
- Creates an `Order` (`status: "unpaid"`) and a `ServiceInstance`
  (`state: checkout_started`) + an `AutomationTimelineEvent`.
- `checkoutUrl` is `null` until a payment processor is wired server-side.
  Frontend MUST NOT treat the order as paid in that case.

### `POST /marketplace/projects/:id/checkout` (auth)
No body. Reads the existing `ClientProject`, mirrors the same response shape,
`status` is `"quote_requested"` when the budget is missing/zero, otherwise
`"unpaid"`.

### `POST /orders` (auth) — legacy bulk creator (one-off services)
### `GET /orders` — list current user's orders (newest first, max 100)
### `GET /orders/:id` — single order, user-scoped (404 otherwise)
### `GET /orders/:id/status` — `{ status, order }`

## Order shape
| Field | Notes |
|-------|-------|
| `id` | cuid |
| `userId` | auth.uid — only the owner can read it |
| `serviceKey` | `marketplace:<category>` for marketplace orders |
| `serviceInstanceId` | links to `ServiceInstance` for state machine |
| `status` | `unpaid`/`paid`/`quote_requested`/... — payment lifecycle |
| `amountCents` | computed server-side from tier+addons+qty |
| `currency` | default `CAD` |
| `meta` | `{ kind, packageId?, projectId?, tier?, addons?, subtotalCents, taxesCents, totalCents }` |

## Payment release states (`PaymentReleaseState`)
`unpaid → checkout_started → paid_to_takatak → assigned → accepted_by_freelancer → in_progress → submitted → (approved | revision_requested) → grace_period → released`

Side branches: `disputed`, `cancelled`, `refunded`.

## Security
- Payment processor API keys live ONLY in backend env. The frontend never
  sees them.
- The browser receives `checkoutUrl` (string) or `null`. No card data,
  customer IDs, or processor tokens cross the boundary.
- All `orders/*` routes require `requireAuth` and filter by `userId`.
- Freelancer-facing views (`/dashboard/freelancer/*`) MUST NOT include
  client billing amounts or payment processor identifiers.
- The frontend never fakes a `paid` state. If `checkoutUrl` is `null` it
  shows a fallback explaining that checkout isn't configured yet.

## Outstanding (manual production steps)
- Wire a real payment processor (Stripe Checkout recommended) inside the
  package/project checkout handlers and return a real `checkoutUrl`.
- Implement webhook handler under `/api/public/webhooks/payments/*` that
  marks the order `paid` and transitions the linked `ServiceInstance` to
  `paid_to_takatak` (already modeled as `paid` in `ServiceState`).
- Add admin endpoints to advance payment release states
  (`assigned → released`) — currently exposed via project/freelancer
  routes; full release/payout automation is intentionally manual.