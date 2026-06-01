# TAKATAK Marketplace — Admin Catalog API (planned)

Internal admin-only endpoints for managing the marketplace package catalog.
All endpoints require `admin` role and are mounted under `/admin/marketplace/*`
on the backend (`backend/src/routes/admin.ts`).

These endpoints are **planned**. The catalog is currently driven by
`src/lib/marketplacePackages.ts` (frontend) and
`backend/src/seed/marketplacePackages.ts` (backend seed), which together
materialize the 44 TAKATAK packages.

## Endpoints

### `GET /admin/marketplace/packages`
List all marketplace packages (active + draft + archived).

Query: `?status=active|draft|archived`, `?category=<slug>`, `?q=<text>`

Response:
```json
{
  "packages": [
    {
      "id": "website-starter",
      "title": "Starter business website",
      "category": "website_design",
      "priceCents": 29900,
      "active": true,
      "archivedAt": null
    }
  ]
}
```

### `POST /admin/marketplace/packages`
Create a new package. Body matches the `MarketplacePackageDetail` shape from
`src/lib/marketplacePackages.ts` (title, category, tiers, addons, faq,
deliverables, intakeRequired, quoteAvailable).

### `PATCH /admin/marketplace/packages/:id`
Update fields on an existing package (price, copy, tiers, status flag).

### `POST /admin/marketplace/packages/:id/archive`
Soft-archive a package. Archived packages are hidden from the marketplace,
search and category pages but remain referenced by historical orders.

## Catalog source-of-truth rules

- No fake freelancers — every package leaves `freelancerId = null` until
  TAKATAK assigns a vetted Groupe TAKATAK freelancer per order.
- No fake paid orders — package creation never produces an order; orders only
  exist after `/orders/checkout` succeeds.
- Currency is CAD cents.
- Prices, delivery estimates, add-ons, FAQ and deliverables must stay in sync
  between the frontend catalog and the backend seed.