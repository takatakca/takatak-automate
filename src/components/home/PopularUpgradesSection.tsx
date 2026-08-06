import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Clock } from "lucide-react";
import { ServiceThumbnail } from "@/components/marketplace/ServiceThumbnail";
import { getPackage, formatStartingPrice, shortestDelivery } from "@/lib/marketplacePackages";
import { useLanguage } from "@/hooks/useLanguage";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";

/** Four large, visual upgrades. The full catalogue lives in /marketplace. */
const IDS = ["website-starter", "logo-design", "local-seo-setup", "workflow-automation"] as const;

export function PopularUpgradesSection() {
  const { t } = useLanguage();
  const packages = IDS.map((id) => getPackage(id)).filter(Boolean);

  return (
    <section className="relative border-b border-border bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(700px 320px at 85% 10%, color-mix(in oklab, var(--primary) 8%, transparent), transparent 65%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        <Reveal>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <h2 className="min-w-0 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("home.popular.title")}
            </h2>
            <Link to="/marketplace" className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              {t("home.popular.browse")} <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {packages.map((p, i) => (
            <Reveal key={p!.id} delay={i * 70}>
              <TiltCard max={5}>
                <Link
                  to="/marketplace/gigs/$id"
                  params={{ id: p!.id }}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50 hover:shadow-[var(--shadow-card)]"
                >
                  <div className="relative aspect-[16/8] overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]">
                      <ServiceThumbnail kind={p!.thumb} />
                    </div>
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
                      <BadgeCheck size={11} /> {t("home.popular.verified")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-semibold leading-7 text-foreground">{p!.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">{p!.blurb}</p>
                    <div className="mt-auto flex items-center justify-between pt-6">
                      <span className="text-lg font-bold text-foreground">{formatStartingPrice(p!)}</span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={13} /> {shortestDelivery(p!)}d
                      </span>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
