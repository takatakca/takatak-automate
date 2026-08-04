// TAKATAK homepage intent routing. Maps a free-text (typed or spoken)
// request to the best destination route on the site.

export interface IntentMatch {
  /** Destination path, may include a query string. */
  to: string;
  /** Human label describing where we are sending the user. */
  label: string;
  /** Matched intent key (analytics). */
  intent: string;
}

interface Rule {
  intent: string;
  label: string;
  to: string | ((q: string) => string);
  keywords: readonly string[];
}

const enc = (q: string) => `/marketplace/search?q=${encodeURIComponent(q)}`;

const rules: readonly Rule[] = [
  {
    intent: "domain",
    label: "Domain search",
    to: "/domain",
    keywords: ["domain", "domaine", ".ca", ".com", ".net", ".org", "register name", "domain name", "buy a name", "dns", "nom de domaine"],
  },
  {
    intent: "hosting",
    label: "Hosting plans",
    to: "/hosting",
    keywords: ["hosting", "hebergement", "hébergement", "host my", "wordpress hosting", "server", "serveur", "cpanel", "ssl", "vps"],
  },
  {
    intent: "voip",
    label: "Business VoIP",
    to: "/services/voip",
    keywords: ["voip", "phone", "telephone", "téléphone", "calls", "call routing", "ivr", "business number", "sip"],
  },
  {
    intent: "local_visibility",
    label: "Local visibility",
    to: "/services/local-listings",
    keywords: ["local listing", "google maps", "maps", "qmaps", "directory", "directories", "google business", "local seo", "found locally"],
  },
  {
    intent: "leads",
    label: "Lead generation",
    to: "/services/lead-generation",
    keywords: ["lead", "leads", "more customers", "new clients", "flexs", "prospect", "prospects", "sales pipeline"],
  },
  {
    intent: "social",
    label: "Social media",
    to: "/services/social-media",
    keywords: ["social media", "instagram", "facebook posts", "tiktok", "posts", "metricool", "content calendar"],
  },
  {
    intent: "marketing",
    label: "Marketing",
    to: "/services/marketing",
    keywords: ["marketing", "ads", "advertising", "google ads", "meta ads", "campaign", "seo", "publicité"],
  },
  {
    intent: "automation",
    label: "Automation & AI tools",
    to: "/services/ai-business-tools",
    keywords: ["automation", "automate", "ai workflow", "ai tool", "ai assistant", "chatbot", "integrations", "zapier"],
  },
  {
    intent: "mobile_app",
    label: "Mobile apps",
    to: enc("mobile app"),
    keywords: ["mobile app", "ios app", "android app", "app store", " app", "application"],
  },
  {
    intent: "logo",
    label: "Logo & branding",
    to: enc("logo"),
    keywords: ["logo", "branding", "brand identity", "brand kit", "visual identity"],
  },
  {
    intent: "website",
    label: "Website services",
    to: (q) => enc(q),
    keywords: ["website", "web site", "site web", "landing page", "web page", "online store", "ecommerce", "shop online", "webshop"],
  },
];

export function resolveIntent(rawQuery: string): IntentMatch {
  const q = rawQuery.trim();
  const lower = ` ${q.toLowerCase()} `;

  for (const rule of rules) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return {
        to: typeof rule.to === "function" ? rule.to(q) : rule.to,
        label: rule.label,
        intent: rule.intent,
      };
    }
  }

  return { to: q ? enc(q) : "/marketplace", label: "Marketplace search", intent: "unknown" };
}

export const searchSuggestions = [
  { label: "Search domains", query: "Search a domain name" },
  { label: "Build a website", query: "I need a website for my business" },
  { label: "View hosting", query: "I need hosting for WordPress" },
  { label: "Get leads", query: "I need more local customers" },
  { label: "Create logo", query: "I need a logo" },
  { label: "Start marketing", query: "I need marketing and ads" },
] as const;

/** Fire a dataLayer analytics event; never throws if analytics is absent. */
export function trackEvent(event: string, payload: Record<string, unknown> = {}): void {
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    if (!w.dataLayer) w.dataLayer = [];
    w.dataLayer.push({ event, ...payload });
  } catch {
    /* analytics is best-effort */
  }
}
