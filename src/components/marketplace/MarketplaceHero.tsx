import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, ShieldCheck, Star, Clock } from "lucide-react";
import { ServiceThumbnail } from "./ServiceThumbnail";

const QUICK_PICKS = [
  "Logo design",
  "Website",
  "Social media",
  "Shopify store",
  "Local SEO",
  "Menu design",
];

const HERO_PREVIEW = [
  { thumb: "website" as const, title: "Business website build", price: "$180", rating: "4.9", delivery: "5 days" },
  { thumb: "logo" as const, title: "Brand logo design", price: "$25", rating: "5.0", delivery: "2 days" },
  { thumb: "social" as const, title: "Social content pack", price: "$40", rating: "4.8", delivery: "4 days" },
  { thumb: "ai" as const, title: "AI assistant setup", price: "$150", rating: "4.9", delivery: "5 days" },
];

export function MarketplaceHero() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const go = (term: string = q) => {
    if (!term.trim()) return;
    void navigate({ to: "/marketplace/search", search: { q: term } as never });
  };
  return (
    <section className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.05] text-foreground">
            Find the right freelancer
            <br />
            for any service.
          </h1>
          <p className="mt-5 text-muted-foreground max-w-xl text-base md:text-lg">
            Websites, branding, content, marketing, automation and more — delivered through TAKATAK with escrow protection on every project.
          </p>
          <div className="mt-7 max-w-xl">
            <div className="flex items-stretch rounded-lg border border-foreground/80 bg-card overflow-hidden focus-within:border-foreground transition-colors">
              <div className="flex items-center pl-4 text-muted-foreground">
                <Search size={18} />
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") go(); }}
                placeholder='Search for "logo design"'
                className="flex-1 bg-transparent outline-none px-3 py-3.5 text-[15px] min-w-0 text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={() => go()}
                className="px-6 text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 items-center text-xs">
              <span className="text-muted-foreground">Popular:</span>
              {QUICK_PICKS.map((p) => (
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
          <div className="mt-7 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={14} className="text-primary" />
            Escrow protection — funds only released when you approve the work.
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            {HERO_PREVIEW.map((c) => (
              <div key={c.title} className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
                <ServiceThumbnail kind={c.thumb} />
                <div className="p-3">
                  <div className="text-[13px] font-semibold text-foreground line-clamp-1">{c.title}</div>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Star size={11} className="fill-foreground text-foreground" />
                    <span className="font-semibold text-foreground">{c.rating}</span>
                    <span className="mx-1">·</span>
                    <Clock size={10} />
                    <span>{c.delivery}</span>
                  </div>
                  <div className="mt-2 text-[13px] font-bold text-foreground">From {c.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}