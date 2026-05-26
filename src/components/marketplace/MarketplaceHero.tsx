import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, ShieldCheck, Sparkles, Users } from "lucide-react";

const QUICK_PICKS = [
  "Logo design",
  "WordPress site",
  "Social posts",
  "Shopify store",
  "Local SEO",
];

export function MarketplaceHero() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const go = (term: string = q) => {
    if (!term.trim()) return;
    void navigate({ to: "/marketplace/search", search: { q: term } as never });
  };
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-border bg-secondary text-muted-foreground">
            <Sparkles size={12} className="text-primary" /> TAKATAK Service Marketplace
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-foreground">
            Our freelancers.
            <br />
            <span className="italic" style={{ color: "var(--primary)" }}>Your success.</span>
          </h1>
          <p className="mt-5 text-muted-foreground max-w-xl text-base md:text-lg">
            Hire vetted talent for design, web, content, marketing, automation and AI — delivered through TAKATAK with escrowed payments.
          </p>
          <div className="mt-8 max-w-xl">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card pl-5 pr-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") go(); }}
                placeholder='Search for any service'
                className="flex-1 bg-transparent outline-none text-base py-2 min-w-0 text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={() => go()}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity shrink-0"
              >
                Search
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
              <span className="opacity-70">Popular:</span>
              {QUICK_PICKS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setQ(p); go(p); }}
                  className="px-3 py-1 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-primary" /> Escrowed payments</span>
            <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-primary" /> Vetted freelancers</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles size={14} className="text-primary" /> AI-matched</span>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="relative rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-2 gap-3">
              {[
                { t: "Logo Design", p: "from $25" },
                { t: "Website Dev", p: "from $180" },
                { t: "Social Content", p: "from $40" },
                { t: "AI Setup", p: "from $120" },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl border border-border bg-background p-4">
                  <div className="h-20 rounded-lg" style={{ background: "var(--gradient-hero)", opacity: 0.85 }} />
                  <div className="mt-3 text-sm font-semibold text-foreground">{c.t}</div>
                  <div className="text-xs text-muted-foreground">{c.p}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
              <span>★ 4.9 average rating</span>
              <span>2,000+ deliveries</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}