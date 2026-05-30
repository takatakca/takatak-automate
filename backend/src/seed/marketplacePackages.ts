/** Mirror of the frontend marketplace package catalog (src/lib/marketplacePackages.ts).
 *  Used by future backend seed/import flows to materialize MarketplacePackage rows.
 *  Kept intentionally tier-flat: stores starting price + minimal metadata for the
 *  Prisma model. No fake freelancers attached — every freelancerId stays null until
 *  TAKATAK assigns one. */

export interface SeedPackage {
  id: string;
  title: string;
  category: string;
  description: string;
  priceCents: number; // starting price in CAD cents
  active: boolean;
}

export const MARKETPLACE_PACKAGES_SEED: SeedPackage[] = [
  // Website Development
  { id: "website-starter",       title: "Starter business website",        category: "website_design",       description: "A clean, responsive 5-page website for your business.",            priceCents:  29900, active: true },
  { id: "website-restaurant",    title: "Restaurant website",              category: "website_design",       description: "Menu, hours, reservations and Google Maps — all in one site.",     priceCents:  34900, active: true },
  { id: "landing-page",          title: "High-conversion landing page",    category: "website_design",       description: "A single, focused page built to convert leads.",                   priceCents:  19900, active: true },
  { id: "ecommerce-shopify",     title: "Ecommerce store setup",           category: "ecommerce_setup",      description: "Launch-ready Shopify or WooCommerce store.",                       priceCents:  34900, active: true },
  { id: "booking-website",       title: "Booking & appointments website",  category: "website_design",       description: "Let customers book services online, 24/7.",                        priceCents:  39900, active: true },
  { id: "website-redesign",      title: "Website redesign & speed-up",     category: "website_design",       description: "Modernize your existing site and triple page speed.",              priceCents:  44900, active: true },

  // Mobile App Design
  { id: "app-ui-prototype",      title: "Mobile app UI prototype",         category: "mobile_app_design",    description: "A clickable Figma prototype of your app idea.",                    priceCents:  29900, active: true },
  { id: "customer-app",          title: "Customer-facing mobile app",      category: "mobile_app_design",    description: "iOS + Android app design ready for build.",                        priceCents:  79900, active: true },
  { id: "business-dashboard-app",title: "Business dashboard app",          category: "mobile_app_design",    description: "Internal app UI for staff, drivers or field teams.",               priceCents:  59900, active: false },
  { id: "marketplace-app",       title: "Marketplace / two-sided app",     category: "mobile_app_design",    description: "Customer + provider flows for a marketplace app.",                 priceCents:  99900, active: false },

  // Logo & Branding
  { id: "logo-design",           title: "Professional logo design",        category: "logo_design",          description: "A distinct logo with source files and color variants.",            priceCents:   7900, active: true },
  { id: "brand-identity-kit",    title: "Brand identity kit",              category: "branding",             description: "Logo, palette, type and a usage guide in one pack.",               priceCents:  24900, active: true },
  { id: "business-card-design",  title: "Business card design",            category: "business_card_design", description: "Print-ready, on-brand business cards.",                            priceCents:   4900, active: true },
  { id: "social-brand-kit",      title: "Social media brand kit",          category: "branding",             description: "Consistent templates for every social channel.",                   priceCents:  12900, active: true },

  // Marketing
  { id: "online-ads-setup",      title: "Online ads setup",                category: "online_advertising",   description: "Get your first paid campaigns live, properly tracked.",            priceCents:  24900, active: true },
  { id: "google-ads-campaign",   title: "Google Ads campaign",             category: "online_advertising",   description: "Search + Performance Max campaigns that actually convert.",        priceCents:  29900, active: true },
  { id: "meta-ads",              title: "Facebook & Instagram ads",        category: "online_advertising",   description: "Creative-first ad campaigns on Meta.",                             priceCents:  27900, active: true },
  { id: "email-marketing-setup", title: "Email marketing setup",           category: "online_advertising",   description: "Klaviyo / Mailchimp setup with your first 3 flows.",               priceCents:  19900, active: true },

  // Social Media
  { id: "social-content-pack",   title: "Social media content pack",       category: "social_media_content", description: "A month of on-brand posts, ready to publish.",                     priceCents:  19900, active: true },
  { id: "monthly-posting",       title: "Monthly social posting service",  category: "social_media_content", description: "Content + scheduling, every month, hands-off.",                    priceCents:  34900, active: true },
  { id: "reels-video-plan",      title: "Reels & shorts content plan",     category: "social_media_content", description: "Short-video content built for Reels, TikTok and Shorts.",          priceCents:  24900, active: true },
  { id: "profile-optimization",  title: "Social profile optimization",     category: "social_media_content", description: "Make your profiles work — bios, links, highlights, SEO.",          priceCents:   7900, active: true },

  // SEO & Local Visibility
  { id: "local-seo-setup",       title: "Local SEO setup",                 category: "seo_local_visibility", description: "Rank locally on Google Maps and search.",                          priceCents:  14900, active: true },
  { id: "qmaps-listing-setup",   title: "QMAPS local listing setup",       category: "seo_local_visibility", description: "Launch on TAKATAK's QMAPS local visibility network.",              priceCents:   9900, active: true },
  { id: "gbp-optimization",      title: "Google Business Profile optimization", category: "seo_local_visibility", description: "A full audit and overhaul of your Google Business Profile.",   priceCents:   8900, active: true },
  { id: "citation-package",      title: "Local citation listing package",  category: "seo_local_visibility", description: "Submit and clean your business across local directories.",         priceCents:   9900, active: true },

  // Lead Generation
  { id: "flexs-lead-campaign",   title: "FLEXS lead campaign setup",       category: "online_advertising",   description: "Plug into TAKATAK's FLEXS lead network.",                          priceCents:  29900, active: true },
  { id: "lead-funnel",           title: "Lead funnel setup",               category: "online_advertising",   description: "Landing page + ads + email follow-up.",                            priceCents:  49900, active: true },
  { id: "contact-form-automation", title: "Contact form automation",       category: "automation_setup",     description: "Turn every form submission into an action.",                       priceCents:  14900, active: true },
  { id: "crm-lead-routing",      title: "CRM lead routing setup",          category: "automation_setup",     description: "Right lead, right rep, right now.",                                priceCents:  19900, active: true },

  // Data & Admin
  { id: "data-entry",            title: "Reliable data entry & cleanup",   category: "data_entry",           description: "Accurate entry, formatting and deduplication.",                    priceCents:   4900, active: true },
  { id: "spreadsheet-cleanup",   title: "Spreadsheet cleanup & formulas",  category: "data_entry",           description: "Messy spreadsheet in, clean usable file out.",                     priceCents:   5900, active: true },
  { id: "product-upload",        title: "Ecommerce product upload",        category: "data_entry",           description: "Bulk product upload, attributes and variants.",                    priceCents:   7900, active: true },
  { id: "menu-data-entry",       title: "Restaurant menu data entry",      category: "data_entry",           description: "Bulk menu upload to delivery apps and ordering systems.",          priceCents:   8900, active: true },

  // Design
  { id: "menu-design",           title: "Restaurant menu design",          category: "menu_design",          description: "Print and digital menus that match your brand.",                   priceCents:   8900, active: true },
  { id: "flyer-design",          title: "Flyer design",                    category: "flyer_design",         description: "Eye-catching flyers for events, promos and openings.",             priceCents:   4900, active: true },
  { id: "poster-design",         title: "Poster design",                   category: "flyer_design",         description: "Print-ready posters for events, retail and venues.",               priceCents:   7900, active: true },
  { id: "digital-ad-banner",     title: "Digital ad banner set",           category: "flyer_design",         description: "On-brand ad banners in all the right sizes.",                      priceCents:   7900, active: true },

  // Automation & AI
  { id: "ai-chatbot-setup",      title: "AI chatbot setup",                category: "ai_tool_setup",        description: "A trained chatbot that answers FAQs and captures leads.",          priceCents:  24900, active: true },
  { id: "automation-setup",      title: "Business automation setup",       category: "automation_setup",     description: "Connect your tools and stop doing repetitive tasks.",              priceCents:  24900, active: true },
  { id: "workflow-automation",   title: "Internal workflow automation",    category: "automation_setup",     description: "Replace manual workflows with reliable automations.",              priceCents:  39900, active: true },
  { id: "ai-intake-form",        title: "AI intake form setup",            category: "ai_tool_setup",        description: "A smart intake that briefs your team automatically.",              priceCents:  19900, active: true },

  // VoIP
  { id: "voip-business-phone",   title: "Business phone setup",            category: "automation_setup",     description: "Cloud phone number, voicemail and team routing.",                  priceCents:   9900, active: true },
  { id: "voip-call-routing",     title: "Call routing & IVR setup",        category: "automation_setup",     description: "Send every call to the right person, every time.",                 priceCents:  14900, active: true },
  { id: "voip-sms-voice-workflow", title: "SMS & voice workflow setup",    category: "automation_setup",     description: "Automated SMS and voice flows for bookings and reminders.",        priceCents:  17900, active: true },

  // Content Writing
  { id: "website-copywriting",   title: "Website copywriting",             category: "content_writing",      description: "Clear, conversion-focused website copy.",                          priceCents:  14900, active: true },
];