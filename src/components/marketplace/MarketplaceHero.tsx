import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";

export function MarketplaceHero() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const go = () => void navigate({ to: "/marketplace/search", search: { q } as never });
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 opacity-30" style={{ backgroundImage: "var(--gradient-bg)" }} />
      <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-border bg-secondary/40">
          <Sparkles size={12} className="text-accent" /> TAKATAK Service Marketplace
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
          Find the right talent.
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
            Delivered through TAKATAK.
          </span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Logos, websites, content, automation, AI setup and more — vetted freelancers, escrowed payments, single point of accountability.
        </p>
        <div className="mt-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
            <Search size={18} className="text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") go(); }}
              placeholder="Try: logo for a coffee shop, WordPress site, monthly social posts…"
              className="flex-1 bg-transparent outline-none text-base py-2 min-w-0"
            />
            <button
              onClick={go}
              className="px-5 py-2 rounded-full text-sm font-semibold text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}