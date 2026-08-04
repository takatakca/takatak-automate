import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { pricingGroups, formatCAD, cadenceKeys } from "@/lib/pricing";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/lib/i18n";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing (CAD) — TAKATAK" },
      { name: "description", content: "Transparent CAD pricing for domains, hosting, websites, apps, branding, marketing, VoIP, automation and design services." },
      { property: "og:title", content: "Pricing (CAD) — TAKATAK" },
      { property: "og:description", content: "Transparent starting prices in CAD across every TAKATAK service." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { t } = useLanguage();
  /** Falls back to the source-of-truth English name when no key exists. */
  const label = (key: string, fallback: string) => {
    const value = t(key as TranslationKey);
    return value === key ? fallback : value;
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">{t("pricing.title")}</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">{t("pricing.intro")}</p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pricingGroups.map((g) => (
            <div key={g.key} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-base font-semibold text-foreground">{label(`pg.${g.key}.title`, g.title)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{label(`pg.${g.key}.blurb`, g.blurb)}</p>
              <ul className="mt-4 space-y-2.5">
                {g.tiers.map((tier) => (
                  <li key={tier.key} className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
                    <span className="text-sm text-muted-foreground">{label(`tier.${g.key}.${tier.key}`, tier.name)}</span>
                    <span className="shrink-0 text-sm font-bold text-foreground">
                      {formatCAD(tier.amount)}
                      <span className="text-xs font-medium text-muted-foreground">
                        {t(cadenceKeys[tier.cadence] as TranslationKey)}
                        {tier.suffix ? ` ${tier.suffix === "+ ad spend" ? t("suffix.adSpend") : tier.suffix}` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to={g.href as never}
                className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary hover:underline"
              >
                {t("pricing.getStarted")} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">{t("pricing.note")}</p>
      </div>
    </SiteShell>
  );
}
