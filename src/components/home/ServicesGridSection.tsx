import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { pricing, formatCAD, cadenceKeys, type Cadence } from "@/lib/pricing";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/lib/i18n";
import { Reveal } from "./Reveal";

interface Card { k: string; amount: number; cadence: Cadence; to: string }

const CARDS: readonly Card[] = [
  { k: "domains",    amount: pricing.domain.register.amount, cadence: "yearly",   to: "/domain" },
  { k: "hosting",    amount: pricing.hosting[0].amount,      cadence: "monthly",  to: "/hosting" },
  { k: "websites",   amount: pricing.websites[0].amount,     cadence: "one-time", to: "/services/websites" },
  { k: "branding",   amount: pricing.branding[0].amount,     cadence: "one-time", to: "/marketplace/gigs/logo-design" },
  { k: "apps",       amount: pricing.apps[0].amount,         cadence: "one-time", to: "/services/mobile-apps" },
  { k: "marketing",  amount: pricing.marketing[0].amount,    cadence: "one-time", to: "/services/marketing" },
  { k: "social",     amount: pricing.social[0].amount,       cadence: "monthly",  to: "/services/social-media" },
  { k: "local",      amount: pricing.local[0].amount,        cadence: "one-time", to: "/services/local-listings" },
  { k: "leads",      amount: pricing.leads[1].amount,        cadence: "per-lead", to: "/services/lead-generation" },
  { k: "voip",       amount: pricing.voip[0].amount,         cadence: "monthly",  to: "/services/voip" },
  { k: "automation", amount: pricing.ai[0].amount,           cadence: "one-time", to: "/services/ai-business-tools" },
  { k: "print",      amount: pricing.design[0].amount,       cadence: "one-time", to: "/marketplace/gigs/menu-design" },
];

export function ServicesGridSection() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <Reveal className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">{t("home.grid.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("home.grid.subtitle")}</p>
        </div>
        <Link to="/services" className="shrink-0 text-sm font-semibold text-primary hover:underline">{t("home.grid.viewAll")}</Link>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CARDS.map((c, i) => (
          <Reveal key={c.k} delay={Math.min(i, 7) * 45} className="h-full">
          <Link
            to={c.to as never}
            className="tk-sheen group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="sr-only">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="min-w-0 text-base font-semibold text-foreground">{t(`cat.${c.k}.title` as TranslationKey)}</h3>
              <span className="shrink-0 text-sm font-bold text-foreground">
                {formatCAD(c.amount)}
                <span className="text-xs font-medium text-muted-foreground">{t(cadenceKeys[c.cadence] as TranslationKey)}</span>
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`sgrid.${c.k}.benefit` as TranslationKey)}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t(`sgrid.${c.k}.tags` as TranslationKey).split(",").map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{tag}</span>
              ))}
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary">
              {t(`sgrid.${c.k}.cta` as TranslationKey)} <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
