export type ServiceCategory =
  | "infrastructure"
  | "build"
  | "growth"
  | "communication"
  | "marketplace";

export type IntegrationType =
  | "upmind"
  | "takatak_ai_backend"
  | "external_portal"
  | "takatak_marketplace";

export type AutomationLevel = "full" | "partial" | "manual";

export interface ServiceDefinition {
  key: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: ServiceCategory;
  publicRoute: string;
  dashboardRoute: string;
  checkoutType: "upmind" | "takatak" | "intake_first";
  integrationType: IntegrationType;
  automationLevel: AutomationLevel;
  requiresPayment: boolean;
  requiresIntake: boolean;
  canAutoProvision: boolean | "partial";
  status: "live" | "beta" | "coming_soon";
  ctaLabel: string;
  dashboardCtaLabel: string;
  /** Env var key for fallback portal URL (frontend) */
  portalEnvKey?: string;
  /** Optional override for the serviceKey sent to /integrations/launch */
  launchKey?: string;
}

export const services: ServiceDefinition[] = [
  {
    key: "domains",
    title: "Domain Names",
    shortDescription: "Search, register, and manage domains with instant provisioning.",
    longDescription:
      "Register .com, .ca, and 300+ TLDs. Auto-DNS, free privacy, instant activation through TAKATAK's provisioning engine.",
    category: "infrastructure",
    publicRoute: "/domain",
    dashboardRoute: "/dashboard/domains",
    checkoutType: "upmind",
    integrationType: "upmind",
    automationLevel: "full",
    requiresPayment: true,
    requiresIntake: false,
    canAutoProvision: true,
    status: "live",
    ctaLabel: "Search domains",
    dashboardCtaLabel: "Manage domains",
  },
  {
    key: "hosting",
    title: "Web Hosting",
    shortDescription: "Managed cPanel + WordPress hosting with one-click deploys.",
    longDescription:
      "Litespeed-powered hosting with free migrations, daily backups, AI security monitoring, and 24/7 expert support.",
    category: "infrastructure",
    publicRoute: "/hosting",
    dashboardRoute: "/dashboard/hosting",
    checkoutType: "upmind",
    integrationType: "upmind",
    automationLevel: "full",
    requiresPayment: true,
    requiresIntake: false,
    canAutoProvision: true,
    status: "live",
    ctaLabel: "View hosting plans",
    dashboardCtaLabel: "Manage hosting",
  },
  {
    key: "websites",
    title: "Website Creation",
    shortDescription: "AI-assisted website builds — brief in, live site out.",
    longDescription:
      "Tell TAKATAK AI about your business. We assemble copy, design, structure, and launch your site on managed hosting.",
    category: "build",
    publicRoute: "/services/websites",
    dashboardRoute: "/dashboard/websites",
    checkoutType: "intake_first",
    integrationType: "takatak_ai_backend",
    automationLevel: "partial",
    requiresPayment: true,
    requiresIntake: true,
    canAutoProvision: "partial",
    status: "beta",
    ctaLabel: "Start website intake",
    dashboardCtaLabel: "Open project",
  },
  {
    key: "mobile_apps",
    title: "Mobile App Creation",
    shortDescription: "iOS and Android apps built from a guided AI brief.",
    longDescription:
      "From idea to App Store. Our AI intake captures features, screens, and integrations; TAKATAK builds and ships.",
    category: "build",
    publicRoute: "/services/mobile-apps",
    dashboardRoute: "/dashboard/mobile-apps",
    checkoutType: "intake_first",
    integrationType: "takatak_ai_backend",
    automationLevel: "partial",
    requiresPayment: true,
    requiresIntake: true,
    canAutoProvision: "partial",
    status: "beta",
    ctaLabel: "Start app intake",
    dashboardCtaLabel: "Open project",
  },
  {
    key: "online_marketing",
    title: "Online Marketing",
    shortDescription: "AI-planned campaigns across Google, Meta, and more.",
    longDescription:
      "Automated audience research, ad creative, landing pages, and reporting. Powered by TAKATAK AI workflows.",
    category: "growth",
    publicRoute: "/services/marketing",
    dashboardRoute: "/dashboard/marketing",
    checkoutType: "intake_first",
    integrationType: "takatak_ai_backend",
    automationLevel: "partial",
    requiresPayment: true,
    requiresIntake: true,
    canAutoProvision: "partial",
    status: "beta",
    ctaLabel: "Start marketing intake",
    dashboardCtaLabel: "Open campaigns",
    portalEnvKey: "VITE_MARKETING_PORTAL_URL",
  },
  {
    key: "social_media",
    title: "Social Media Automation",
    shortDescription: "Schedule, publish, and analyze across all your channels.",
    longDescription:
      "Connect your social accounts, generate posts with AI, queue campaigns, and track results — from one TAKATAK portal.",
    category: "growth",
    publicRoute: "/services/social-media",
    dashboardRoute: "/dashboard/social",
    checkoutType: "intake_first",
    integrationType: "external_portal",
    automationLevel: "partial",
    requiresPayment: true,
    requiresIntake: true,
    canAutoProvision: false,
    status: "beta",
    ctaLabel: "Set up social",
    dashboardCtaLabel: "Open social portal",
    portalEnvKey: "VITE_SOCIAL_PORTAL_URL",
  },
  {
    key: "local_listings",
    title: "Local Listing Visibility",
    shortDescription: "Be found on Google, Apple, Bing, and 50+ directories.",
    longDescription:
      "Sync your business info everywhere it matters. Monitor reviews and rank locally with TAKATAK's listing automation.",
    category: "growth",
    publicRoute: "/services/local-listings",
    dashboardRoute: "/dashboard/local-listings",
    checkoutType: "intake_first",
    integrationType: "external_portal",
    automationLevel: "partial",
    requiresPayment: true,
    requiresIntake: true,
    canAutoProvision: false,
    status: "beta",
    ctaLabel: "Claim listings",
    dashboardCtaLabel: "Open listings portal",
    portalEnvKey: "VITE_QMAPS_PORTAL_URL",
    launchKey: "qmaps",
  },
  {
    key: "lead_generation",
    title: "Lead Generation",
    shortDescription: "Qualified, exclusive leads delivered to your dashboard.",
    longDescription:
      "Tell us who you sell to. TAKATAK AI sources, qualifies, and routes leads into your CRM or dashboard inbox.",
    category: "growth",
    publicRoute: "/services/lead-generation",
    dashboardRoute: "/dashboard/leads",
    checkoutType: "intake_first",
    integrationType: "external_portal",
    automationLevel: "partial",
    requiresPayment: true,
    requiresIntake: true,
    canAutoProvision: false,
    status: "beta",
    ctaLabel: "Set up lead gen",
    dashboardCtaLabel: "Open leads portal",
    portalEnvKey: "VITE_FLEXS_PORTAL_URL",
    launchKey: "flexs",
  },
  {
    key: "voip_phone",
    title: "VoIP Business Phone",
    shortDescription: "Cloud phone numbers, call routing, and AI transcription.",
    longDescription:
      "Get a Canadian or US business number, IVR menus, voicemail-to-text, and AI call summaries — fully managed.",
    category: "communication",
    publicRoute: "/services/voip",
    dashboardRoute: "/dashboard/voip",
    checkoutType: "intake_first",
    integrationType: "external_portal",
    automationLevel: "partial",
    requiresPayment: true,
    requiresIntake: true,
    canAutoProvision: false,
    status: "beta",
    ctaLabel: "Set up VoIP",
    dashboardCtaLabel: "Open phone portal",
    portalEnvKey: "VITE_VOIP_PORTAL_URL",
  },
  {
    key: "ai_business_tools",
    title: "AI-Assisted Business Tools",
    shortDescription: "Custom AI workflows for your operations.",
    longDescription:
      "Customer support agents, document parsing, internal copilots — TAKATAK builds AI that runs your back office.",
    category: "build",
    publicRoute: "/services/ai-business-tools",
    dashboardRoute: "/dashboard/ai-tools",
    checkoutType: "intake_first",
    integrationType: "takatak_ai_backend",
    automationLevel: "partial",
    requiresPayment: true,
    requiresIntake: true,
    canAutoProvision: "partial",
    status: "beta",
    ctaLabel: "Describe your workflow",
    dashboardCtaLabel: "Open AI tools",
  },
  {
    key: "freelancer_marketplace",
    title: "TAKATAK Service Marketplace",
    shortDescription:
      "Find vetted freelancers and TAKATAK service partners for logos, websites, apps, design, data entry, and online business tasks.",
    longDescription:
      "Browse gigs or post a project. Get proposals, milestones, deliveries, and revisions — all inside the TAKATAK dashboard.",
    category: "marketplace",
    publicRoute: "/services/marketplace",
    dashboardRoute: "/dashboard/marketplace",
    checkoutType: "takatak",
    integrationType: "takatak_marketplace",
    automationLevel: "partial",
    requiresPayment: false,
    requiresIntake: false,
    canAutoProvision: false,
    status: "beta",
    ctaLabel: "Browse marketplace",
    dashboardCtaLabel: "Open marketplace",
    portalEnvKey: "VITE_MARKETPLACE_PORTAL_URL",
  },
];

export function getService(key: string): ServiceDefinition | undefined {
  return services.find((s) => s.key === key);
}

export const marketplaceCategories = [
  "Logo Design",
  "Website Design",
  "Mobile App Design",
  "Page Layout",
  "Data Entry",
  "Social Media Content",
  "Online Advertising",
  "Business Automation",
  "SEO & Local Visibility",
  "Virtual Assistance",
] as const;