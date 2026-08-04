import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { pricing, formatCAD, cadenceLabel, type Cadence } from "@/lib/pricing";

interface Card {
  title: string;
  benefit: string;
  amount: number;
  cadence: Cadence;
  tags: readonly string[];
  to: string;
  cta: string;
}

const CARDS: readonly Card[] = [
  { title: "Domain Names",          benefit: "Secure the right name for your business.",      amount: pricing.domain.register.amount, cadence: "yearly",   tags: [".ca", ".com", "DNS"],              to: "/domain",                       cta: "Search domains" },
  { title: "Web Hosting",           benefit: "Managed hosting with SSL and daily backups.",   amount: pricing.hosting[0].amount,      cadence: "monthly",  tags: ["SSL", "Backups", "cPanel"],        to: "/hosting",                      cta: "View plans" },
  { title: "Website Creation",      benefit: "Sites designed to turn visitors into clients.", amount: pricing.websites[0].amount,     cadence: "one-time", tags: ["Design", "Mobile", "SEO-ready"],   to: "/services/websites",            cta: "Start website" },
  { title: "Logo Design",           benefit: "A clear, professional brand mark.",             amount: pricing.branding[0].amount,     cadence: "one-time", tags: ["Concepts", "Files", "Brand kit"],  to: "/marketplace/gigs/logo-design", cta: "Start branding" },
  { title: "Mobile App Creation",   benefit: "iOS and Android builds for your operations.",   amount: pricing.apps[0].amount,         cadence: "one-time", tags: ["iOS", "Android", "MVP"],           to: "/services/mobile-apps",         cta: "Start app" },
  { title: "Online Marketing",      benefit: "Campaigns that bring real customers.",          amount: pricing.marketing[0].amount,    cadence: "one-time", tags: ["Google Ads", "Meta", "Funnels"],   to: "/services/marketing",           cta: "Start marketing" },
  { title: "Social Media",          benefit: "Content planned, produced and published.",      amount: pricing.social[0].amount,       cadence: "monthly",  tags: ["Content", "Calendar", "Reports"],  to: "/services/social-media",        cta: "Set up social" },
  { title: "Local Visibility",      benefit: "Get found on Maps and local directories.",      amount: pricing.local[0].amount,        cadence: "one-time", tags: ["QMAPS", "Maps", "Citations"],      to: "/services/local-listings",      cta: "Improve visibility" },
  { title: "Lead Generation",       benefit: "Qualified leads delivered to your pipeline.",   amount: pricing.leads[1].amount,        cadence: "per-lead", tags: ["FLEXS", "Funnels", "CRM"],         to: "/services/lead-generation",     cta: "Get leads" },
  { title: "VoIP Business Phone",   benefit: "Business numbers, IVR and call routing.",       amount: pricing.voip[0].amount,         cadence: "monthly",  tags: ["Numbers", "IVR", "SMS"],           to: "/services/voip",                cta: "Set up VoIP" },
  { title: "Automation Tools",      benefit: "Put repetitive operations on rails.",           amount: pricing.ai[0].amount,           cadence: "one-time", tags: ["Workflows", "Integrations", "AI"], to: "/services/ai-business-tools",   cta: "Automate work" },
  { title: "Menu & Flyer Design",   benefit: "Print-ready design for local businesses.",      amount: pricing.design[0].amount,       cadence: "one-time", tags: ["Menus", "Flyers", "Print"],        to: "/marketplace/gigs/menu-design", cta: "Start design" },
];

export function ServicesGridSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Explore TAKATAK services</h2>
          <p className="mt-2 text-sm text-muted-foreground">Transparent CAD pricing, managed delivery, Canadian support.</p>
        </div>
        <Link to="/services" className="shrink-0 text-sm font-semibold text-primary hover:underline">View all services</Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CARDS.map((c) => (
          <Link
            key={c.title}
            to={c.to as never}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/45"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="min-w-0 text-base font-semibold text-foreground">{c.title}</h3>
              <span className="shrink-0 text-sm font-bold text-foreground">
                {formatCAD(c.amount)}
                <span className="text-xs font-medium text-muted-foreground">{cadenceLabel(c.cadence)}</span>
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{c.benefit}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.tags.map((t) => (
                <span key={t} className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>
              ))}
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary">
              {c.cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
