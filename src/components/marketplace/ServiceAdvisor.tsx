import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Sparkles, Loader2 } from "lucide-react";
import { aiServiceAdvisor, type AdvisorResult } from "@/lib/advisor.functions";

const EXAMPLES = [
  "Bakery needs logo + Instagram presence",
  "Restaurant menu redesign + online ordering",
  "Local plumber needs Google Maps visibility",
  "Startup needs landing page + brand kit",
];

export function ServiceAdvisor({ defaultQuery = "" }: { defaultQuery?: string }) {
  const advise = useServerFn(aiServiceAdvisor);
  const [q, setQ] = useState(defaultQuery);
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await advise({ data: { query: q } });
      setResult(r);
    } finally { setLoading(false); }
  };

  return (
    <div className="relative rounded-2xl border border-border bg-card p-6 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="relative flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-secondary/40">
          <Sparkles size={14} className="text-accent" />
        </span>
        <div>
          <h3 className="font-semibold leading-tight">TAKATAK AI Advisor</h3>
          <p className="text-xs text-muted-foreground">Describe what you need — we'll recommend the right TAKATAK services.</p>
        </div>
      </div>
      <div className="relative mt-4 flex flex-col sm:flex-row gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void run(); }}
          placeholder="e.g. I run a bakery and need a logo, website, and social posts"
          className="flex-1 rounded-md border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
        />
        <button
          onClick={() => void run()}
          disabled={loading}
          className="px-4 py-2 rounded-md text-sm font-medium text-primary-foreground inline-flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Advise
        </button>
      </div>
      {!result && !loading && (
        <div className="relative mt-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Try one</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => setQ(e)}
                className="px-3 py-1.5 rounded-full text-xs border border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
      {result && (
        <div className="mt-5 space-y-3">
          <p className="text-sm">{result.summary}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.recommendations.map((r, i) => (
              <div key={i} className="rounded-lg border border-border bg-background/40 p-3 hover:border-primary/40 transition-colors">
                <div className="font-medium text-sm">{r.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{r.reason}</div>
                <Link to={r.cta.to} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
                  {r.cta.label} →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Source: {result.source}</div>
        </div>
      )}
    </div>
  );
}