// English (en-CA) UI copy. Keys are dot-namespaced by surface.
export const en = {
  "lang.switch": "Language",
  "lang.en": "English",
  "lang.fr": "Français",

  "nav.marketplace": "Marketplace",
  "nav.domains": "Domains",
  "nav.hosting": "Hosting",
  "nav.services": "Services",
  "nav.pricing": "Pricing",
  "nav.signin": "Sign in",
  "nav.getStarted": "Get started",
  "nav.dashboard": "Dashboard",
  "nav.signout": "Sign out",

  "search.placeholder": "What do you need? e.g. restaurant website, hosting, more leads",
  "search.aria": "Describe what you need",
  "search.go": "Go",
  "search.listening": "Listening…",
  "search.voiceStart": "Start voice input",
  "search.voiceStop": "Stop voice input",
  "search.voiceError": "Voice input didn't work — type your request instead.",

  "assistant.bestMatch": "Best match",
  "assistant.next": "Recommended next step: open {label} for “{query}”.",
  "assistant.open": "Open service",
  "assistant.support": "Talk to support",
  "assistant.quote": "Request custom quote",
  "assistant.dismiss": "Dismiss",

  "service.whatItDoes": "What this service does",
  "service.howItWorks": "How it works",
  "service.benefits": "Why businesses choose it",
  "service.packages": "Packages & pricing",
  "service.faq": "Frequently asked questions",
  "service.startingAt": "Starting at",
  "service.cadNote": "All prices in CAD. Scope confirmed before work begins.",
  "service.talkToTakatak": "Talk to TAKATAK",
  "service.requestQuote": "Request a custom quote",
  "service.seeAll": "See all services",
  "service.relatedMarketplace": "Browse marketplace packages",

  "cta.title": "Ready to start?",
  "cta.body": "Tell us what you need. A TAKATAK specialist confirms scope, pricing and timeline before anything begins.",

  "common.explore": "Explore",
  "common.viewPricing": "View pricing",
} as const;

export type TranslationKey = keyof typeof en;