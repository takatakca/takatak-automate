import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { formatCAD, cadenceLabel } from "@/lib/pricing";
import { servicePages } from "@/lib/servicePages";
import { useLanguage } from "@/hooks/useLanguage";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "All Services — TAKATAK" },
      { name: "description", content: "Every TAKATAK service: domains, hosting, websites, apps, marketing, social, local visibility, leads, VoIP, automation and marketplace talent." },
      { property: "og:title", content: "All Services — TAKATAK" },
      { property: "og:description", content: "Domains, hosting, websites, apps, marketing, VoIP, automation and vetted marketplace talent — all in CAD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  const { t, tx, lang } = useLanguage();
  const groups = Array.from(new Set(servicePages.map((p) => p.eyebrow.en)));

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          {lang === "fr" ? "Tous les services" : "All services"}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          {lang === "fr"
            ? "Tous les services livrés par TAKATAK, avec configuration gérée et soutien canadien. Prix en CAD."
            : "Every service TAKATAK delivers, with managed setup and Canadian support. Prices in CAD."}
        </p>
        <Link to="/pricing" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          {t("common.viewPricing")} <ArrowRight size={14} />
        </Link>

        {groups.map((g) => {
          const items = servicePages.filter((p) => p.eyebrow.en === g);
          if (!items.length) return null;
          const groupLabel = tx(items[0]!.eyebrow);
          return (
            <section key={g} className="mt-12">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{groupLabel}</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => {
                  const amount = s.packages.reduce(
                    (min, p) => (p.amount < min ? p.amount : min),
                    s.packages[0]?.amount ?? 0,
                  );
                  const cadence = s.packages.find((p) => p.amount === amount)?.cadence;
                  return (
                    <Link
                      key={s.slug}
                      to={s.route as never}
                      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/45"
                    >
                      <h3 className="text-base font-semibold text-foreground">{tx(s.title)}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{tx(s.tagline)}</p>
                      <div className="mt-auto flex items-center justify-between pt-5">
                        {amount > 0 && (
                          <span className="text-sm font-bold text-foreground">
                            {t("service.startingAt")} {formatCAD(amount)}
                            <span className="text-xs font-medium text-muted-foreground">
                              {cadence ? cadenceLabel(cadence) : ""}
                            </span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                          {t("common.explore")} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </SiteShell>
  );
}
