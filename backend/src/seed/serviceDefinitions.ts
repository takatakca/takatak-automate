/** Canonical TAKATAK service keys mirrored from the frontend (src/lib/services.ts). */
export const SERVICE_DEFINITIONS = [
  { key: "domains",                portalSlug: null },
  { key: "hosting",                portalSlug: null },
  { key: "websites",               portalSlug: null },
  { key: "mobile_apps",            portalSlug: null },
  { key: "online_marketing",       portalSlug: "marketing" },
  { key: "social_media",           portalSlug: "social_media" },
  { key: "local_listings",         portalSlug: "qmaps" },
  { key: "lead_generation",        portalSlug: "flexs" },
  { key: "voip_phone",             portalSlug: "voip_phone" },
  { key: "ai_business_tools",      portalSlug: null },
  { key: "freelancer_marketplace", portalSlug: "marketplace" },
] as const;
