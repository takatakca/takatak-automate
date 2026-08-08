import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Globe2, MapPin, Server, Smartphone, Sparkles, Workflow } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { pricing, formatCAD } from "@/lib/pricing";
import { Reveal } from "./Reveal";
import { PerspectiveCard } from "@/components/motion/PerspectiveCard";
import { SceneShell, SceneBar, SceneChip, SceneBrowser } from "./discovery/SceneShell";
import { BrandingDiscoveryVisual } from "./discovery/BrandingDiscoveryVisual";
import { LocalGrowthDiscoveryVisual } from "./discovery/LocalGrowthDiscoveryVisual";
import { OperationsDiscoveryVisual } from "./discovery/OperationsDiscoveryVisual";

function PremiumWebsiteVisual() {
  const { t } = useLanguage();
  return (
    <SceneShell ratio="aspect-[16/9] md:aspect-[16/8]">
      <div className="absolute inset-0 p-4 md:p-6">
        <SceneBrowser label="yourbusiness.ca" className="h-full">
          <div className="p-3">
            <div className="flex items-center gap-2">
              <SceneBar delay={140} tone="primary" className="h-2 w-10" />
              <SceneBar delay={200} className="h-1.5 w-8" />
              <SceneBar delay={240} className="h-1.5 w-8" />
              <SceneBar delay={300} tone="primary" className="ml-auto h-4 w-14 rounded" />
            </div>
            <div className="mt-3 grid grid-cols-[1.5fr_1fr] gap-3">
              <div>
                <SceneBar delay={380} tone="strong" className="h-3 w-[80%]" />
                <SceneBar delay={430} tone="strong" className="mt-2 h-3 w-[55%]" />
                <SceneBar delay={500} className="mt-3 h-1.5 w-[92%]" />
                <SceneBar delay={540} className="mt-1.5 h-1.5 w-[74%]" />
              </div>
              <SceneBar delay={600} className="h-full min-h-[52px] w-full rounded-md" />
            </div>
          </div>
        </SceneBrowser>
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1.5">
        <SceneChip delay={780}><Globe2 size={9} className="text-primary" /> Domain</SceneChip>
        <SceneChip delay={880}><Server size={9} className="text-primary" /> Hosting</SceneChip>
        <SceneChip delay={980}><Smartphone size={9} className="text-primary" /> Mobile</SceneChip>
        <SceneChip delay={1100} className="border-primary/60 text-primary">
          <Check size={9} /> {t("upg.website.status")}
        </SceneChip>
      </div>
    </SceneShell>
  );
}

function CardFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <PerspectiveCard max={4}>
      <article
        className={`tk-sheen group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/50 hover:shadow-[var(--shadow-glow)] md:p-6 ${className}`}
      >
        {children}
      </article>
    </PerspectiveCard>
  );
}

function Cta({ to, label, primary = true }: { to: string; label: string; primary?: boolean }) {
  return (
    <Link
      to={to as never}
      className={
        primary
          ? "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          : "inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      }
    >
      {label}
      {primary && <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />}
    </Link>
  );
}

/**
 * Popular business upgrades — asymmetric editorial composition:
 * one large website feature, two stacked secondary cards, and a wide
 * cinematic automation card.
 */
export function PopularBusinessUpgrades() {
  const { t } = useLanguage();
  return (
    <section className="relative border-b border-border bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(760px 340px at 82% 8%, color-mix(in oklab, var(--primary) 9%, transparent), transparent 66%), radial-gradient(600px 320px at 8% 90%, color-mix(in oklab, var(--primary) 6%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        <Reveal>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <h2 className="min-w-0 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("upg.title")}</h2>
            <Link to="/marketplace" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              {t("upg.browse")} <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>

        <div className="mt-9 grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* Large feature */}
          <Reveal className="lg:col-span-3">
            <CardFrame>
              <PremiumWebsiteVisual />
              <div className="mt-5 flex items-start justify-between gap-3">
                <h3 className="min-w-0 text-xl font-bold leading-8 text-foreground md:text-2xl">{t("upg.website.title")}</h3>
                <span className="shrink-0 rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                  {t("price.from")} {formatCAD(pricing.websites[0].amount)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("upg.website.desc")}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {(["c1", "c2", "c3", "c4"] as const).map((c) => (
                  <li key={c} className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/70 px-2.5 py-1 text-[11px] font-medium text-foreground">
                    <Check size={10} className="text-primary" /> {t(`upg.website.${c}` as never)}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <Cta to="/services/websites" label={t("upg.website.cta")} />
                <Cta to="/pricing" label={t("upg.website.cta2")} primary={false} />
              </div>
            </CardFrame>
          </Reveal>

          {/* Secondary column */}
          <div className="grid gap-5 lg:col-span-2">
            <Reveal delay={80}>
              <CardFrame>
                <BrandingDiscoveryVisual />
                <h3 className="mt-4 text-lg font-semibold leading-7 text-foreground">{t("upg.brand.title")}</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{t("upg.brand.desc")}</p>
                <div className="mt-auto pt-5">
                  <Cta to="/services/logo-branding" label={t("upg.brand.cta")} />
                </div>
              </CardFrame>
            </Reveal>

            <Reveal delay={140}>
              <CardFrame>
                <LocalGrowthDiscoveryVisual />
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                    <MapPin size={10} className="text-primary" /> {t("upg.local.chipQ")}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                    <Sparkles size={10} className="text-primary" /> {t("upg.local.chipF")}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold leading-7 text-foreground">{t("upg.local.title")}</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{t("upg.local.desc")}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Cta to="/services/local-listings" label={t("upg.local.cta")} />
                  <Cta to="/services/lead-generation" label={t("upg.local.cta2")} primary={false} />
                </div>
              </CardFrame>
            </Reveal>
          </div>

          {/* Wide cinematic automation card */}
          <Reveal delay={100} className="lg:col-span-5">
            <CardFrame>
              <div className="grid gap-5 md:grid-cols-[1fr_1.1fr] md:items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                    <Workflow size={11} className="text-primary" /> {t("price.from")} {formatCAD(pricing.ai[0].amount)}
                  </span>
                  <h3 className="mt-3 text-xl font-bold leading-8 text-foreground md:text-2xl">{t("upg.auto.title")}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("upg.auto.desc")}</p>
                  <div className="mt-5">
                    <Cta to="/services/automation" label={t("upg.auto.cta")} />
                  </div>
                </div>
                <OperationsDiscoveryVisual />
              </div>
            </CardFrame>
          </Reveal>
        </div>
      </div>
    </section>
  );
}