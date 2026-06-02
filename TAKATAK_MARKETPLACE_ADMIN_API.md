# TAKATAK Marketplace — Admin Catalog API (planned)

Internal admin-only endpoints for managing the marketplace package catalog.
All endpoints require `admin` role and are mounted under `/admin/marketplace/*`
on the backend (`backend/src/routes/admin.ts`).

These endpoints are **planned**. The catalog is currently driven by
`src/lib/marketplacePackages.ts` (frontend, also the live UI fallback when
the backend is offline) and `backend/src/seed/marketplacePackages.ts`
(backend seed — enriched mirror), which together materialize the 44
TAKATAK packages. The backend seed is intended to become the source of
truth once the admin endpoints below ship; the frontend file will keep
working as a fallback so the marketplace UI never breaks if the API is
unavailable.

## Package metadata shape

The `MarketplacePackage` Prisma model now carries the full metadata needed
to render the marketplace from backend data:

| Field             | Type              | Notes |
|-------------------|-------------------|-------|
| `id`              | string (cuid/slug)| Stable identifier, also used as slug. |
| `slug`            | string (unique)   | URL slug; equals `id`. Indexed. |
| `title`           | string            | 1..120 chars. |
| `category`        | string            | Category slug, indexed. |
| `shortDescription`| string            | 1..280 chars, card copy. |
| `longDescription` | string            | Detail-page copy. |
| `priceCents`      | int (CAD cents)   | Starting price (lowest tier). |
| `currency`        | "CAD"             | Currently CAD only. |
| `deliveryDays`    | int               | Fastest tier delivery. |
| `deliveryEstimate`| string            | "7 days" / "7–14 days". |
| `serviceKey`      | string            | Related TAKATAK service, indexed. |
| `requiresIntake`  | boolean           | AI/managed intake required. |
| `allowsQuote`     | boolean           | Custom quote CTA available. |
| `status`          | enum-string       | `active` \| `draft` \| `archived`. Indexed. |
| `active`          | boolean           | Legacy flag, kept in sync with status. Indexed. |
| `tags`            | string[]          | Search tags. |
| `tiers`           | Json              | `[{ name, priceCents, deliveryDays, revisions, includes[] }]` |
| `addOns`          | Json              | `[{ label, priceCents, deliveryDays? }]` |
| `deliverables`    | Json              | `string[]` of "what you get". |
| `faq`             | Json              | `[{ q, a }]` |
| `metadata`        | Json              | Open bag (thumb kind, rating, reviews, ctaText, etc.). |
| `freelancerId`    | string?           | Always null in seed — assigned per order only. |

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
      "slug": "website-starter",
      "title": "Starter business website",
      "category": "website_design",
      "shortDescription": "A clean, responsive 5-page website for your business.",
      "priceCents": 29900,
      "currency": "CAD",
      "deliveryDays": 7,
      "deliveryEstimate": "7–14 days",
      "serviceKey": "websites",
      "requiresIntake": true,
      "allowsQuote": true,
      "status": "active",
      "active": true,
      "tags": ["website", "web", "site", "wordpress", "landing", "business"]
    }
  ]
}
```

### `GET /admin/marketplace/packages/:id`
Return a single package with full metadata (tiers, addOns, deliverables, faq, metadata).

Response:
```json
{
  "package": {
    "id": "website-starter",
    "slug": "website-starter",
    "title": "Starter business website",
    "category": "website_design",
    "shortDescription": "A clean, responsive 5-page website for your business.",
    "longDescription": "TAKATAK assigns a vetted developer ...",
    "priceCents": 29900,
    "currency": "CAD",
    "deliveryDays": 7,
    "deliveryEstimate": "7–14 days",
    "serviceKey": "websites",
    "requiresIntake": true,
    "allowsQuote": true,
    "status": "active",
    "active": true,
    "tags": ["website", "wordpress", "landing"],
    "tiers": [
      { "name": "Basic",    "priceCents": 29900, "deliveryDays": 7,  "revisions": 2,           "includes": ["Up to 3 pages", "Mobile responsive"] },
      { "name": "Standard", "priceCents": 54900, "deliveryDays": 10, "revisions": 3,           "includes": ["Up to 5 pages", "Custom design"] },
      { "name": "Premium",  "priceCents": 99900, "deliveryDays": 14, "revisions": "Unlimited", "includes": ["Up to 8 pages", "Booking form"] }
    ],
    "addOns": [
      { "label": "Extra page",                 "priceCents": 4900,  "deliveryDays": 1 },
      { "label": "Multilingual setup (FR/EN)", "priceCents": 12900, "deliveryDays": 3 }
    ],
    "deliverables": ["Up to 5 pages", "Mobile responsive", "Contact form", "On-page SEO"],
    "faq": [
      { "q": "Who owns the final files?", "a": "You own all deliverables ..." }
    ],
    "metadata": { "thumb": "website", "rating": 4.9, "reviews": 184 }
  }
}
```

### `POST /admin/marketplace/packages`
Create a new package. Body matches the `SeedPackage` shape from
`backend/src/seed/marketplacePackages.ts`.

Validation rules (mirrored in `assertValidSeedPackage`, ready to swap for
Zod once the route ships):

- `id` and `slug` must be kebab-case (`^[a-z0-9-]+$`) and equal.
- `title` 1..120 chars, `shortDescription` 1..280 chars.
- `priceCents` integer ≥ 0, `currency` must be `"CAD"`.
- `status` ∈ `{active, draft, archived}`.
- `tiers[]` each: `name`, `priceCents` ≥ 0, `deliveryDays` ≥ 1, `revisions`, `includes[]`.
- `addOns[]`, `deliverables[]`, `faq[]`, `tags[]` are required arrays (may be empty).
- `freelancerId` MUST be null at create — assignment happens per order only.

Example request:
```json
{
  "id": "custom-pkg",
  "slug": "custom-pkg",
  "title": "Custom package",
  "category": "website_design",
  "shortDescription": "Short one-liner shown on cards.",
  "longDescription": "Long marketing copy for the detail page.",
  "priceCents": 29900,
  "currency": "CAD",
  "deliveryDays": 7,
  "deliveryEstimate": "7 days",
  "serviceKey": "websites",
  "requiresIntake": false,
  "allowsQuote": true,
  "status": "draft",
  "active": false,
  "tags": ["website"],
  "tiers": [
    { "name": "Basic", "priceCents": 29900, "deliveryDays": 7, "revisions": 2, "includes": ["1 page"] }
  ],
  "addOns": [],
  "deliverables": ["1 page"],
  "faq": [],
  "metadata": {}
}
```

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
  between the frontend catalog and the backend seed. The backend seed file
  imports a verbatim copy of the frontend catalog
  (`backend/src/seed/marketplacePackagesCatalog.ts`) so the two cannot drift.
- Seeds upsert by `slug` — re-running `prisma db seed` never produces duplicates.
- The frontend catalog at `src/lib/marketplacePackages.ts` stays in place as
  the UI fallback so the marketplace remains usable even if the backend
  catalog API is down.