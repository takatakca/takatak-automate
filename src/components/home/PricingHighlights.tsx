import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { pricing, formatCAD, cadenceLabel, type Cadence } from "@/lib/pricing";

const TILES: readonly { label: string; amount: number; cadence: Cadence; to: string }[] = [
  { label: "Domains",    amount: pricing.domain.register.amount, cadence: "yearly",   to: "/domain" },
  { label: "Hosting",    amount: pricing.hosting[0].amount,      cadence: "monthly",  to: "/hosting" },
  { label: "Websites",   amount: pricing.websites[0].amount,     cadence: "one-time", to: "/services/websites" },
  { label: "Logos",      amount: pricing.branding[0].amount,     cadence: "one-time", to: "/marketplace/gigs/logo-design" },
  { label: "Marketing",  amount: pricing.marketing[0].amount,    cadence: "one-time", to: "/services/marketing" },
  { label: "Automation", amount: pricing.ai[0].amount,           cadence: "one-time", to: "/services/ai-business-tools" },
];

export function PricingHighlights() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:py-16">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <h2 className="min-w-0 text-2xl font-bold text-foreground md:text-3xl">Transparent starting prices</h2>
        <Link to="/pricing" className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          View full pricing <ArrowRight size={14} />
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {TILES.map((t) => (
          <Link
            key={t.label}
            to={t.to as never}
            className="rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/45"
          >
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.label}</div>
            <div className="mt-1.5 text-lg font-bold text-foreground">
              {formatCAD(t.amount)}
              <span className="text-xs font-medium text-muted-foreground">{cadenceLabel(t.cadence)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
