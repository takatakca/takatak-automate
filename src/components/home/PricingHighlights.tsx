import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { pricing, formatCAD, cadenceKeys, type Cadence } from "@/lib/pricing";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/lib/i18n";
import { Reveal } from "./Reveal";

const TILES: readonly { labelKey: TranslationKey; amount: number; cadence: Cadence; to: string }[] = [
  { labelKey: "cat.domains.title",    amount: pricing.domain.register.amount, cadence: "yearly",   to: "/domain" },
  { labelKey: "cat.hosting.title",    amount: pricing.hosting[0].amount,      cadence: "monthly",  to: "/hosting" },
  { labelKey: "cat.websites.title",   amount: pricing.websites[0].amount,     cadence: "one-time", to: "/services/websites" },
  { labelKey: "cat.branding.title",   amount: pricing.branding[0].amount,     cadence: "one-time", to: "/marketplace/gigs/logo-design" },
  { labelKey: "cat.marketing.title",  amount: pricing.marketing[0].amount,    cadence: "one-time", to: "/services/marketing" },
  { labelKey: "cat.automation.title", amount: pricing.ai[0].amount,           cadence: "one-time", to: "/services/ai-business-tools" },
];

export function PricingHighlights() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:py-16">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <h2 className="min-w-0 text-2xl font-bold text-foreground md:text-3xl">{t("home.prices.title")}</h2>
        <Link to="/pricing" className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          {t("home.prices.viewAll")} <ArrowRight size={14} />
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {TILES.map((tile, i) => (
          <Reveal key={tile.labelKey} delay={i * 50}>
            <Link
              to={tile.to as never}
              className="tk-sheen block h-full rounded-xl border border-border bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-card)]"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t(tile.labelKey)}</div>
              <div className="mt-1.5 text-lg font-bold text-foreground">
                {formatCAD(tile.amount)}
                <span className="text-xs font-medium text-muted-foreground">{t(cadenceKeys[tile.cadence] as TranslationKey)}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">{t("home.prices.note")}</p>
    </section>
  );
}
