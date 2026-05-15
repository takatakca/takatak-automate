import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Globe, Server, Sparkles, Megaphone, Share2, MapPin, PhoneCall, Users,
  Bot, Store, ArrowRight, ShieldCheck, Zap, Workflow,
} from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { services } from "@/lib/services";
import { brand } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TAKATAK — Launch, host, market, and automate your business" },
      { name: "description", content: brand.tagline },
    ],
  }),
  component: Index,
});

const serviceIcons: Record<string, typeof Globe> = {
  domains: Globe,
  hosting: Server,
  websites: Sparkles,
  mobile_apps: Sparkles,
  online_marketing: Megaphone,
  social_media: Share2,
  local_listings: MapPin,
  lead_generation: Users,
  voip_phone: PhoneCall,
  ai_business_tools: Bot,
  freelancer_marketplace: Store,
};

const flow = [
  { icon: Store, title: "Choose service", desc: "Browse the TAKATAK catalog." },
  { icon: ShieldCheck, title: "Pay securely", desc: "Checkout via Upmind or TAKATAK." },
  { icon: Zap, title: "Provision automatically", desc: "Domains, hosting, accounts — all hands-off." },
  { icon: Bot, title: "AI-assisted setup", desc: "TAKATAK AI captures your brief." },
  { icon: Workflow, title: "Track everything", desc: "Live status from your dashboard." },
];

function Index() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30" style={{ backgroundImage: "var(--gradient-bg)" }} />
        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-border bg-secondary/40">
            <Sparkles size={12} className="text-accent" /> Automation-first online business services
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            Launch, host, market, and{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
              automate
            </span>{" "}
            your business with TAKATAK.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            TAKATAK connects websites, domains, hosting, marketing, social media, VoIP,
            local visibility, leads, and AI-assisted workflows into one managed client portal.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-lg font-semibold text-primary-foreground inline-flex items-center gap-2"
              style={{ backgroundImage: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}
            >
              Start with TAKATAK <ArrowRight size={16} />
            </Link>
            <Link
              to="/services/marketplace"
              className="px-6 py-3 rounded-lg font-medium border border-border hover:bg-secondary/50"
            >
              Explore services
            </Link>
          </div>
        </div>
      </section>

      {/* Domain quick start */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="rounded-3xl border border-border bg-card/50 backdrop-blur p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold">Get your business online in minutes</h2>
          <p className="mt-2 text-muted-foreground">Search a domain or pick a hosting plan to start.</p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/domain" className="px-5 py-2.5 rounded-md text-sm font-semibold text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>
              Search a domain
            </Link>
            <Link to="/hosting" className="px-5 py-2.5 rounded-md text-sm font-medium border border-border">
              View hosting
            </Link>
          </div>
        </div>
      </section>

      {/* Automated flow */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">The automated TAKATAK flow</h2>
          <p className="mt-3 text-muted-foreground">From order to active service — no waiting, no chasing.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4">
          {flow.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6 relative">
                <div className="text-xs text-muted-foreground">Step {i + 1}</div>
                <Icon className="mt-3 text-primary" size={24} />
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core services */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">Core services</h2>
            <p className="mt-2 text-muted-foreground">Everything you need to run a business online.</p>
          </div>
          <Link to="/services/marketplace" className="text-sm text-primary inline-flex items-center gap-1">
            See marketplace <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => {
            const Icon = serviceIcons[s.key] ?? Sparkles;
            return (
              <Link
                key={s.key}
                to={s.publicRoute}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.shortDescription}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary opacity-80 group-hover:opacity-100">
                  {s.ctaLabel} <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h3 className="text-2xl font-bold">One dashboard. Every service.</h3>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Track provisioning, automation jobs, AI intake, invoices, and support — all in one place.
          </p>
          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            Open dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
