import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Sparkles, Loader2 } from "lucide-react";
import { aiServiceAdvisor, type AdvisorResult } from "@/lib/advisor.functions";

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
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-accent" />
        <h3 className="font-semibold">TAKATAK AI Advisor</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Describe what you need — we'll recommend the right TAKATAK services.</p>
      <div className="mt-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void run(); }}
          placeholder="e.g. I run a bakery and need a logo, website, and social posts"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={() => void run()}
          disabled={loading}
          className="px-4 py-2 rounded-md text-sm font-medium text-primary-foreground inline-flex items-center gap-2"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Advise
        </button>
      </div>
      {result && (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-muted-foreground">{result.summary}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.recommendations.map((r, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
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