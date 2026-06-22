# TAKATAK Promotions — backend contract (FIRST10)

The frontend persists promo state in `localStorage` under
`takatak.promo.first10` so the new-client offer survives signup. The backend
remains the source of truth for eligibility, redemption, and final totals.
Until these endpoints exist the UI shows the offer as "saved" and never
marks an order paid.

## Endpoints

| Method | Path                  | Auth     | Purpose                                                                 |
| ------ | --------------------- | -------- | ----------------------------------------------------------------------- |
| GET    | `/promotions/me`      | required | Return the caller's promotion state (`available` / `claimed` / `used`). |
| POST   | `/promotions/claim`   | required | Claim a promo code for the user. Body: `{ code: "FIRST10" }`.           |
| POST   | `/promotions/apply`   | required | Preview discount on an order draft. Body: `{ orderId, code }`.          |
| POST   | `/promotions/redeem`  | required | Atomically attach a promo to an order at checkout. Server-side only.    |

## Promotion model

```ts
interface Promotion {
  id: string;
  userId: string;
  code: string;            // "FIRST10"
  type: "percent";
  percentOff: number;      // 10
  status: "available" | "claimed" | "applied" | "redeemed" | "expired" | "cancelled";
  claimedAt?: string;
  redeemedAt?: string;
  expiresAt?: string | null;
  metadata?: Record<string, unknown>;
}
```

## FIRST10 rules

- `code: "FIRST10"`, `percentOff: 10`
- Eligible only on the user's **first** eligible TAKATAK service order.
- One use per user.
- Cannot be applied to an order already in a paid / completed state.
- Discount is **calculated server-side**; the frontend preview is illustrative.
- Failure responses must include a machine-readable reason
  (`ineligible_already_used`, `ineligible_not_first_order`, `expired`, `invalid_code`).

## Implementation status

Endpoints implemented in `backend/src/routes/promotions.ts`:

- `GET /promotions/me` — returns the caller's promotions + available codes.
- `POST /promotions/claim` — idempotent; one row per `(userId, code)`.
- `POST /promotions/apply` — server-side discount calc; attaches promo to a
  draft order when `orderId` is provided.
- `GET /admin/promotions`, `POST /admin/promotions/:id/cancel`,
  `POST /admin/promotions/:id/restore` — admin maintenance.

Checkout endpoints (`/marketplace/packages/:id/checkout`,
`/marketplace/projects/:id/checkout`) accept an optional `promoCode` and
compute `subtotalCents`, `discountCents`, `totalCents` server-side. The
payment webhook (`/api/public/webhooks/payments`) calls
`redeemPromotionForOrder` on `paid_to_takatak` and `releasePromotionForOrder`
on `failed` / `cancelled`. Refunded orders keep promo `redeemed` unless an
admin restores it manually.

## Frontend fallback

If `/promotions/*` returns an error the frontend keeps the existing local
behaviour (`status: "pending" | "claimed"`), shows
"Offer saved locally. Final discount is confirmed at checkout.", and never
modifies order totals or payment state on its own.
