import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Globe, Server, Sparkles, Megaphone, Share2, MapPin, PhoneCall, Users,
  Bot, Store, ArrowRight, ShieldCheck, Search,
} from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { services } from "@/lib/services";
import { brand } from "@/lib/brand";
import { PopularServicesGrid } from "@/components/marketplace/PopularServicesGrid";
import { HowItWorks } from "@/components/marketplace/HowItWorks";
import { TrustBlock } from "@/components/marketplace/TrustBlock";

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

const POPULAR = ["Website design", "Logo design", "Hosting", "Local SEO", "Social media", "Data entry"];

function Index() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const go = (term: string = q) => {
    if (!term.trim()) return;
    void navigate({ to: "/marketplace/search", search: { q: term } as never });
  };
  return (
    <SiteShell>
      {/* Marketplace-style hero */}
      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.05] text-foreground max-w-3xl mx-auto">
            Find the right business service for your next project
          </h1>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Websites, domains, hosting, marketing, local visibility, AI tools, and managed project delivery through TAKATAK.
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex items-stretch rounded-lg border border-foreground/80 bg-card overflow-hidden focus-within:border-foreground transition-colors shadow-sm">
              <div className="flex items-center pl-4 text-muted-foreground">
                <Search size={18} />
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") go(); }}
                placeholder="What service are you looking for today?"
                className="flex-1 bg-transparent outline-none px-3 py-3.5 text-[15px] min-w-0 text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={() => go()}
                className="px-6 text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 items-center justify-center text-xs">
              <span className="text-muted-foreground">Popular:</span>
              {POPULAR.map((p) => (
                <button
                  key={p}
                  onClick={() => { setQ(p); go(p); }}
                  className="px-2.5 py-1 rounded-full border border-border bg-card text-foreground hover:border-foreground/40 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck size={14} className="text-primary" />
            Escrow protection on every order — released only when you approve.
          </div>
        </div>
      </section>

      {/* Popular services */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Popular services</h2>
            <p className="mt-1 text-sm text-muted-foreground">Hand-picked services from vetted TAKATAK freelancers.</p>
          </div>
          <Link to="/marketplace" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <PopularServicesGrid />
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <HowItWorks />
      </div>

      {/* Core services / business solutions */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">TAKATAK business solutions</h2>
            <p className="mt-1 text-sm text-muted-foreground">Beyond freelance work — managed services to run your business.</p>
          </div>
          <Link to="/services/marketplace" className="text-sm text-primary inline-flex items-center gap-1">
            See marketplace <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => {
            const Icon = serviceIcons[s.key] ?? Sparkles;
            return (
              <Link
                key={s.key}
                to={s.publicRoute}
                className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.shortDescription}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {s.ctaLabel} <ArrowRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <TrustBlock />
      </div>

      {/* Final CTA */}
      <section className="border-t border-border bg-secondary/40">
        <div className="max-w-7xl mx-auto px-4 py-14 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">Ready to start your next project?</h3>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto text-sm">{brand.tagline}</p>
          <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
            <Link to="/marketplace/post-project" className="px-5 py-2.5 rounded-md text-sm font-semibold text-primary-foreground bg-primary inline-flex items-center gap-2">
              Post a custom project <ArrowRight size={14} />
            </Link>
            <Link to="/dashboard" className="px-5 py-2.5 rounded-md text-sm font-medium border border-border bg-card hover:bg-secondary">
              Open dashboard
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
