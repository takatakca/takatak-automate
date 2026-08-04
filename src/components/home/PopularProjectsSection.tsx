import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Clock } from "lucide-react";
import { ServiceThumbnail } from "@/components/marketplace/ServiceThumbnail";
import { getPackage, formatStartingPrice, shortestDelivery } from "@/lib/marketplacePackages";
import { useLanguage } from "@/hooks/useLanguage";

const IDS = [
  "website-starter",
  "logo-design",
  "menu-design",
  "local-seo-setup",
  "social-content-pack",
  "lead-funnel",
  "voip-business-phone",
  "workflow-automation",
] as const;

export function PopularProjectsSection() {
  const { t } = useLanguage();
  const packages = IDS.map((id) => getPackage(id)).filter(Boolean);

  return (
    <section className="bg-secondary/30 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">{t("home.popular.title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("home.popular.subtitle")}</p>
          </div>
          <Link to="/marketplace" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            {t("home.popular.browse")}
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((p) => (
            <Link
              key={p!.id}
              to="/marketplace/gigs/$id"
              params={{ id: p!.id }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[var(--shadow-card)]"
            >
              <ServiceThumbnail kind={p!.thumb} />
              <div className="flex flex-1 flex-col p-4">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <BadgeCheck size={11} /> {t("home.popular.verified")}
                </span>
                <h3 className="mt-2.5 text-sm font-semibold leading-6 text-foreground">{p!.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{p!.blurb}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-sm font-bold text-foreground">{formatStartingPrice(p!)}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} /> {shortestDelivery(p!)}d
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          to="/marketplace"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary/45"
        >
          {t("home.popular.seeAll")} <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
