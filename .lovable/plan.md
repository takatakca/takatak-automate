# Premium Homepage Revamp + CAD Pricing

## Scope
Full rebuild of the TAKATAK homepage into a premium 2026 SaaS landing page, plus a centralized pricing config in CAD used across the home page, hosting, domain, and service pages. No changes to auth, marketplace order flow, Upmind scripts, MCP, backend, or Render deploy.

## 1. Centralized pricing config
Create `src/lib/pricing.ts` as the single source of truth (CAD).

```text
pricing = {
  domain:    { register: 19.99/yr, transfer: 19.99 },
  hosting:   [portfolio 9.99, bronze 19.99, silver 39.99, gold 79.99] /mo,
  websites:  [starter 499, business 1499, premium 2999, ecommerce 3999],
  apps:      [prototype 1999, mvp 7500, custom 15000+],
  branding:  [logo 149, kit 499, identity 1499],
  marketing: [setup 299, monthly 499/mo, growth 1500/mo + ad spend],
  social:    [starter 149, business 399, pro 799] /mo,
  local:     [setup 99, mgmt 199/mo, multi 499/mo],
  leads:     [setup 299, perLead 25, managed 750/mo],
  voip:      [starter 19.99, business 49.99, ai 99] /mo,
  ai:        [workflow 399, assistant 999, ops 2500+],
  admin:     [entry 99, cleanup 149, workflow 399],
  design:    [flyer 99, menu 199, campaign 499],
}
```
Helpers: `formatCAD(amount)`, `startingAt(amount, cadence?)`.

## 2. Homepage rebuild (`src/routes/index.tsx`)
Sections in order:

1. **PremiumHero** — dark full-bleed hero, headline "Launch, manage, and grow your business online with TAKATAK", subhead, primary CTA "Explore services" → `/marketplace`, secondary CTA "Start a project" → `/marketplace/post-project`, quick links row (search domains, hosting plans, build a website, browse marketplace), trust badges strip, dashboard/marketplace mockup collage on the right.
2. **BusinessInfrastructureSection** — ecosystem map (SVG connected nodes) with Domains, Hosting, Website, Marketing, Local, Leads, VoIP, AI, Marketplace.
3. **FeaturedPricingSection** — 12 "starting at" cards driven by pricing.ts, category chips, CTA per card. Footer disclaimer.
4. **HostingSpotlight** — 4 hosting plan compare cards (portfolio/bronze/silver/gold) with real prices, features, "View hosting plans" → `/hosting`.
5. **DomainSpotlight** — search-bar mockup, TLD chips (.ca .com .net .org), managed setup / DNS + email chips, embeds the existing `UpmindDomainSearch`, price badge "from $19.99/year".
6. **MarketplacePreviewSection** — reuse existing `PopularServicesGrid` + `FeaturedServicesStrip`.
7. **PremiumProcessSection** — keep existing.
8. **WhyTakatakSection** — new: managed delivery, human review, secure dashboard, Canadian focus, scalable, real support.
9. **TrustBlock** — keep.
10. **Final dark CTA** — "Ready to build your online business system?".

## 3. Component files (new)
- `src/lib/pricing.ts`
- `src/components/home/PremiumHero.tsx`
- `src/components/home/BusinessInfrastructureMap.tsx` (replaces map-only content of existing ecosystem section on home)
- `src/components/home/FeaturedPricingSection.tsx`
- `src/components/home/HostingSpotlight.tsx`
- `src/components/home/DomainSpotlight.tsx`
- `src/components/home/WhyTakatakSection.tsx`
- `src/components/home/FinalCtaSection.tsx`

Reuse existing: `PremiumProcessSection`, `BusinessEcosystemSection` (keep available but home uses new map), `PopularServicesGrid`, `FeaturedServicesStrip`, `TrustBlock`, `UpmindDomainSearch`, `PromoMarquee`.

## 4. Pricing surfaced on service pages (light touch)
Only where trivial: hosting page badges and domain page badge pull from `pricing.ts`. No behavior changes.

## 5. Visual constraints
- Uses existing brand tokens (`brand-dark`, `--gradient-hero`, cyan/violet accents). No new palette.
- No hardcoded `text-white`/`bg-black`.
- Mobile-first: all sections scroll cleanly at 375px, CTAs above the fold, no horizontal overflow.
- No AI-blob art, no generic gradients, no emoji icons — Lucide + custom mockups only.

## 6. Verification
- `bun run build`
- Playwright screenshot at 1280 and 375 to confirm layout, then view screenshots.
- Curl `/`, `/hosting`, `/domain`, `/marketplace` for 200s.
- Skip backend typecheck (out of scope, no backend files change).

## 7. Non-goals
- No changes to auth, checkout, MCP, Upmind, marketplace routing, RLS/DB, or backend routes.
- No new dependencies.

## Technical notes
- `pricing.ts` exports typed objects; components import named tiers, never inline numbers.
- Ecosystem map is inline SVG + tailwind, no external libs.
- Hero right-side mockup is composed with existing `ServiceThumbnail` + tailwind cards to avoid new image assets.
