import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";

const QUICK_PICKS = [
  "Logo for coffee shop",
  "WordPress site",
  "Monthly social posts",
  "Shopify store setup",
  "Local SEO",
];

export function MarketplaceHero() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const go = () => void navigate({ to: "/marketplace/search", search: { q } as never });
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 opacity-30" style={{ backgroundImage: "var(--gradient-bg)" }} />
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-20" style={{ background: "var(--gradient-hero)" }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-20 w-[480px] h-[480px] rounded-full blur-3xl opacity-15" style={{ background: "var(--gradient-hero)" }} />
      <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-border bg-secondary/40 backdrop-blur">
          <Sparkles size={12} className="text-accent" /> TAKATAK Service Marketplace
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
          Find the right talent.
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
            Delivered through TAKATAK.
          </span>
        </h1>
        <p className="mt-5 text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
          Logos, websites, content, automation, AI setup and more — vetted freelancers, escrowed payments, single point of accountability.
        </p>
        <div className="mt-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur px-4 py-2 shadow-lg shadow-primary/5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-all">
            <Search size={18} className="text-muted-foreground shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") go(); }}
              placeholder="Try: logo for a coffee shop, WordPress site, monthly social posts…"
              className="flex-1 bg-transparent outline-none text-base py-2 min-w-0"
            />
            <button
              onClick={go}
              className="px-5 py-2 rounded-full text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity shrink-0"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              Search
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {QUICK_PICKS.map((p) => (
              <button
                key={p}
                onClick={() => { setQ(p); void navigate({ to: "/marketplace/search", search: { q: p } as never }); }}
                className="px-3 py-1.5 rounded-full text-xs border border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/60 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}