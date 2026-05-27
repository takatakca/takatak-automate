/** Demo catalog of TAKATAK marketplace packages.
 *  Used by search results and the gig detail page when the backend is offline
 *  or has no published packages yet. All listings are TAKATAK-mediated:
 *  clients pay TAKATAK, TAKATAK assigns a vetted freelancer, payment is
 *  released after approval. */

export type ThumbKind =
  | "website" | "mobile" | "logo" | "branding" | "social" | "seo"
  | "data" | "menu" | "flyer" | "ecommerce" | "automation" | "ai";

export interface PackageTier {
  name: "Basic" | "Standard" | "Premium";
  priceCents: number;
  deliveryDays: number;
  revisions: number | "Unlimited";
  includes: string[];
}

export interface PackageAddon {
  label: string;
  priceCents: number;
  deliveryDays?: number;
}

export interface PackageFaq { q: string; a: string }

export interface MarketplacePackageDetail {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  blurb: string;
  description: string;
  thumb: ThumbKind;
  rating: number;
  reviews: number;
  tiers: PackageTier[];
  addons: PackageAddon[];
  faq: PackageFaq[];
  keywords: string[];
}

function t(name: PackageTier["name"], price: number, days: number, revisions: PackageTier["revisions"], includes: string[]): PackageTier {
  return { name, priceCents: price * 100, deliveryDays: days, revisions, includes };
}

export const MARKETPLACE_PACKAGES: MarketplacePackageDetail[] = [
  {
    id: "website-starter",
    title: "Business website — up to 5 pages",
    category: "website_design",
    categoryName: "Website Design",
    blurb: "A responsive WordPress or Next.js site, ready to launch.",
    description: "TAKATAK assigns a vetted freelancer to design and build a professional website tailored to your business. You get a fully responsive site, contact form, and on-page SEO basics. TAKATAK manages the relationship, reviews the work, and releases payment only after you approve the delivery.",
    thumb: "website",
    rating: 4.9, reviews: 184,
    tiers: [
      t("Basic", 299, 7, 2, ["Up to 3 pages", "Mobile responsive", "Contact form", "Basic on-page SEO"]),
      t("Standard", 549, 10, 3, ["Up to 5 pages", "Custom design", "Blog/news section", "On-page SEO", "Google Analytics setup"]),
      t("Premium", 999, 14, "Unlimited", ["Up to 8 pages", "Advanced custom design", "Booking or quote form", "Speed optimization", "1 month of support"]),
    ],
    addons: [
      { label: "Extra page", priceCents: 4900, deliveryDays: 1 },
      { label: "Multilingual setup (FR/EN)", priceCents: 12900, deliveryDays: 3 },
      { label: "Logo design", priceCents: 9900, deliveryDays: 3 },
    ],
    faq: [
      { q: "Who owns the website?", a: "You own the site, domain and content. TAKATAK transfers everything to your account on completion." },
      { q: "Do I talk to the freelancer directly?", a: "All communication runs through your TAKATAK project workspace. TAKATAK reviews deliveries before they reach you." },
      { q: "What if I'm not happy with the result?", a: "Request a revision from the workspace. If we can't resolve it, you can open a dispute and TAKATAK will mediate." },
    ],
    keywords: ["website", "web", "site", "wordpress", "landing"],
  },
  {
    id: "logo-brand",
    title: "Logo design with brand guidelines",
    category: "logo_design",
    categoryName: "Logo Design",
    blurb: "A distinct logo plus colors, fonts and usage rules.",
    description: "Get a professional logo designed by a TAKATAK-vetted designer. Includes brand colors, typography pairing, and a short usage guide. Payment is held by TAKATAK until you approve the final files.",
    thumb: "logo",
    rating: 4.8, reviews: 312,
    tiers: [
      t("Basic", 79, 3, 2, ["1 logo concept", "PNG + SVG", "Color + black-and-white"]),
      t("Standard", 159, 5, 3, ["3 logo concepts", "Full source files", "Color palette", "Social media kit"]),
      t("Premium", 299, 7, "Unlimited", ["5 logo concepts", "Source files (AI/SVG/PDF)", "Brand guidelines PDF", "Stationery mockups"]),
    ],
    addons: [
      { label: "Business card design", priceCents: 4900, deliveryDays: 2 },
      { label: "Extra concept", priceCents: 2900, deliveryDays: 2 },
    ],
    faq: [
      { q: "Do I get the source files?", a: "Yes, Standard and Premium tiers include editable source files." },
      { q: "Is the design original?", a: "Every concept is original work, reviewed by TAKATAK before release." },
    ],
    keywords: ["logo", "brand", "identity", "design"],
  },
  {
    id: "seo-local",
    title: "Local SEO & Google Business setup",
    category: "seo_local_visibility",
    categoryName: "SEO & Local Visibility",
    blurb: "Rank locally on Google Maps and search.",
    description: "A TAKATAK specialist optimizes your Google Business Profile, fixes local citations, and improves your on-page SEO so customers in your area can find you.",
    thumb: "seo",
    rating: 4.7, reviews: 96,
    tiers: [
      t("Basic", 149, 5, 1, ["Google Business setup", "5 local citations", "Keyword report"]),
      t("Standard", 299, 10, 2, ["GBP optimization", "15 citations", "On-page SEO (3 pages)", "Monthly report"]),
      t("Premium", 599, 14, 3, ["Full GBP overhaul", "30+ citations", "On-page SEO (6 pages)", "Competitor analysis", "60-day tracking"]),
    ],
    addons: [
      { label: "Additional 10 citations", priceCents: 5900, deliveryDays: 3 },
      { label: "Review response setup", priceCents: 7900, deliveryDays: 2 },
    ],
    faq: [
      { q: "How fast will I see results?", a: "Local rankings usually improve within 30-60 days. SEO is ongoing." },
      { q: "Do you guarantee #1 on Google?", a: "No one can. TAKATAK delivers proven local SEO best practices and tracks progress transparently." },
    ],
    keywords: ["seo", "google", "local", "maps", "visibility"],
  },
  {
    id: "social-content",
    title: "Social media content pack",
    category: "social_media_content",
    categoryName: "Social Media Content",
    blurb: "A month of on-brand posts, ready to publish.",
    description: "TAKATAK assigns a content creator to produce a full month of social media posts tailored to your brand. You review and approve before anything goes live.",
    thumb: "social",
    rating: 4.8, reviews: 142,
    tiers: [
      t("Basic", 199, 7, 1, ["12 posts/month", "Captions + hashtags", "1 platform"]),
      t("Standard", 379, 10, 2, ["20 posts/month", "Captions + hashtags", "2 platforms", "Content calendar"]),
      t("Premium", 699, 14, 3, ["30 posts/month", "3 platforms", "Reels/Shorts scripts", "Monthly review call"]),
    ],
    addons: [
      { label: "Add platform", priceCents: 9900, deliveryDays: 2 },
      { label: "Video editing (3 reels)", priceCents: 14900, deliveryDays: 5 },
    ],
    faq: [
      { q: "Do you post for me?", a: "Standard and Premium include scheduling. Posts go live only after your approval." },
    ],
    keywords: ["social", "instagram", "facebook", "tiktok", "content"],
  },
  {
    id: "ecom-shopify",
    title: "Ecommerce store setup (Shopify/WooCommerce)",
    category: "ecommerce_setup",
    categoryName: "Ecommerce Setup",
    blurb: "Launch-ready store with products, payments and shipping.",
    description: "Get a fully configured online store. The TAKATAK-assigned specialist sets up your theme, products, payments and shipping rules so you can start selling.",
    thumb: "ecommerce",
    rating: 4.9, reviews: 88,
    tiers: [
      t("Basic", 349, 7, 2, ["Theme setup", "Up to 10 products", "Payments + shipping"]),
      t("Standard", 649, 12, 3, ["Custom theme tweaks", "Up to 30 products", "Tax + multi-currency", "Email confirmations"]),
      t("Premium", 1199, 18, "Unlimited", ["Theme customization", "Up to 75 products", "Apps & integrations", "Abandoned cart setup", "30 days post-launch support"]),
    ],
    addons: [
      { label: "Extra 10 products", priceCents: 7900, deliveryDays: 2 },
      { label: "Migration from another platform", priceCents: 19900, deliveryDays: 5 },
    ],
    faq: [
      { q: "Which platform should I choose?", a: "TAKATAK recommends Shopify for fast launches and WooCommerce for full control. We'll advise based on your brief." },
    ],
    keywords: ["ecommerce", "shop", "shopify", "woocommerce", "store"],
  },
  {
    id: "menu-design",
    title: "Restaurant menu design",
    category: "menu_design",
    categoryName: "Menu Design",
    blurb: "Print and digital menus that match your brand.",
    description: "A TAKATAK designer creates a clean, on-brand menu for your restaurant or cafe. Print-ready PDF and digital version included.",
    thumb: "menu",
    rating: 4.8, reviews: 64,
    tiers: [
      t("Basic", 89, 3, 2, ["1-page menu", "Print-ready PDF"]),
      t("Standard", 169, 5, 3, ["2-page menu", "Print + digital", "Editable source file"]),
      t("Premium", 299, 7, "Unlimited", ["Multi-section menu", "Seasonal variants", "QR code menu", "Source files"]),
    ],
    addons: [
      { label: "Translation (FR/EN)", priceCents: 4900, deliveryDays: 2 },
      { label: "Photography retouching", priceCents: 7900, deliveryDays: 3 },
    ],
    faq: [
      { q: "Do you print the menus?", a: "No, TAKATAK delivers print-ready files. You can print locally or we can recommend a print partner." },
    ],
    keywords: ["menu", "restaurant", "food", "cafe"],
  },
  {
    id: "automation-setup",
    title: "Business automation setup",
    category: "automation_setup",
    categoryName: "Automation Setup",
    blurb: "Connect your tools and stop doing repetitive tasks.",
    description: "TAKATAK builds and tests automations between your CRM, email, calendar, and other tools so manual data entry disappears.",
    thumb: "automation",
    rating: 4.7, reviews: 41,
    tiers: [
      t("Basic", 249, 5, 1, ["1 automation flow", "2 integrated tools", "Documentation"]),
      t("Standard", 499, 10, 2, ["3 automation flows", "Up to 5 tools", "Error notifications"]),
      t("Premium", 899, 14, 3, ["6 automation flows", "Unlimited tools", "Monitoring + 30 days support"]),
    ],
    addons: [
      { label: "Extra flow", priceCents: 9900, deliveryDays: 3 },
      { label: "Custom dashboard", priceCents: 19900, deliveryDays: 5 },
    ],
    faq: [
      { q: "Which tools do you support?", a: "Zapier, Make, n8n, native APIs — TAKATAK picks the right stack for your case." },
    ],
    keywords: ["automation", "zapier", "make", "workflow", "integration"],
  },
  {
    id: "data-entry",
    title: "Reliable data entry & cleanup",
    category: "data_entry",
    categoryName: "Data Entry",
    blurb: "Accurate data entry, formatting and deduplication.",
    description: "A TAKATAK-vetted virtual assistant handles your data entry, list cleaning, and formatting work with quality checks before delivery.",
    thumb: "data",
    rating: 4.9, reviews: 220,
    tiers: [
      t("Basic", 49, 2, 1, ["Up to 200 entries", "1 source file", "CSV/Excel output"]),
      t("Standard", 119, 4, 2, ["Up to 1,000 entries", "Multiple sources", "Deduplication"]),
      t("Premium", 249, 6, 3, ["Up to 5,000 entries", "Validation rules", "Quality report"]),
    ],
    addons: [
      { label: "Extra 500 entries", priceCents: 3900, deliveryDays: 2 },
      { label: "Rush delivery (24h)", priceCents: 4900 },
    ],
    faq: [
      { q: "Is my data confidential?", a: "Yes — TAKATAK contracts include a confidentiality clause with every freelancer." },
    ],
    keywords: ["data", "entry", "spreadsheet", "excel", "cleanup"],
  },
];

export function getPackage(id: string): MarketplacePackageDetail | undefined {
  return MARKETPLACE_PACKAGES.find((p) => p.id === id);
}

export function searchPackages(q: string, categorySlug?: string): MarketplacePackageDetail[] {
  const query = q.trim().toLowerCase();
  return MARKETPLACE_PACKAGES.filter((p) => {
    if (categorySlug && p.category !== categorySlug) return false;
    if (!query) return true;
    if (p.title.toLowerCase().includes(query)) return true;
    if (p.blurb.toLowerCase().includes(query)) return true;
    if (p.categoryName.toLowerCase().includes(query)) return true;
    return p.keywords.some((k) => k.includes(query) || query.includes(k));
  });
}

export function formatStartingPrice(p: MarketplacePackageDetail): string {
  const cents = Math.min(...p.tiers.map((x) => x.priceCents));
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function shortestDelivery(p: MarketplacePackageDetail): number {
  return Math.min(...p.tiers.map((x) => x.deliveryDays));
}
