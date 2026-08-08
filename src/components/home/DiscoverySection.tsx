import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, Palette, Smartphone, Share2, Target, Utensils, ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/lib/i18n";
import { pricing, formatCAD, cadenceKeys, type Cadence } from "@/lib/pricing";
import { Reveal } from "./Reveal";
import { PerspectiveCard } from "@/components/motion/PerspectiveCard";
import { WebsiteDiscoveryVisual } from "./discovery/WebsiteDiscoveryVisual";
import { DomainHostingDiscoveryVisual } from "./discovery/DomainHostingDiscoveryVisual";
import { BrandingDiscoveryVisual } from "./discovery/BrandingDiscoveryVisual";
import { MarketingDiscoveryVisual } from "./discovery/MarketingDiscoveryVisual";
import { LocalGrowthDiscoveryVisual } from "./discovery/LocalGrowthDiscoveryVisual";
import { OperationsDiscoveryVisual } from "./discovery/OperationsDiscoveryVisual";
import { QmapsFlexsStory } from "./discovery/QmapsFlexsStory";

interface Solution {
  k: "websites" | "domains" | "branding" | "marketing" | "local" | "ops";
  visual: ReactNode;
  amount: number;
  cadence: Cadence;
  primary: string;
  secondary: string;
  /** Editorial span on large screens. */
  span: "wide" | "narrow";
  story?: boolean;
}

/** Six art-directed solution groups. Everything else lives on /services. */
const SOLUTIONS: readonly Solution[] = [
  { k: "websites",  visual: <WebsiteDiscoveryVisual />,       amount: pricing.websites[0].amount, cadence: "one-time", primary: "/services/websites",       secondary: "/marketplace/category/website_design", span: "wide" },
  { k: "domains",   visual: <DomainHostingDiscoveryVisual />, amount: pricing.domain.register.amount, cadence: "yearly", primary: "/domain",                secondary: "/hosting",                             span: "narrow" },
  { k: "branding",  visual: <BrandingDiscoveryVisual />,      amount: pricing.branding[0].amount, cadence: "one-time", primary: "/services/logo-branding",  secondary: "/marketplace/category/logo_design",    span: "narrow" },
  { k: "marketing", visual: <MarketingDiscoveryVisual />,     amount: pricing.marketing[0].amount, cadence: "one-time", primary: "/services/marketing",     secondary: "/services/social-media",               span: "wide" },
  { k: "local",     visual: <LocalGrowthDiscoveryVisual />,   amount: pricing.local[0].amount,    cadence: "one-time", primary: "/services/local-listings", secondary: "/services/lead-generation",            span: "wide", story: true },
  { k: "ops",       visual: <OperationsDiscoveryVisual />,    amount: pricing.voip[0].amount,     cadence: "monthly",  primary: "/services/voip",           secondary: "/services/automation",                 span: "narrow" },
];

/** Compact secondary rail — quick access, no cards. */
const RAIL: readonly { icon: LucideIcon; k: string; to: string }[] = [
  { icon: Palette,       k: "branding", to: "/marketplace/category/logo_design" },
  { icon: Smartphone,    k: "apps",     to: "/services/mobile-apps" },
  { icon: Share2,        k: "social",   to: "/services/social-media" },
  { icon: Target,        k: "leads",    to: "/services/lead-generation" },
  { icon: Utensils,      k: "print",    to: "/marketplace/gigs/menu-design" },
  { icon: ClipboardList, k: "data",     to: "/marketplace/category/data_entry" },
];

export function DiscoverySection() {
  const { t } = useLanguage();
  return (
    <section className="relative border-b border-border bg-secondary/25">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--foreground) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 20%, transparent 78%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        <Reveal>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("home.disc.title")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("home.disc.subtitle")}</p>
            </div>
            <Link to="/services" className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              {t("home.disc.all")} <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>

        <ul className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal as="li" key={c.k} delay={Math.min(i, 5) * 60}>
                <TiltCard>
                  <Link
                    to={c.to as never}
                    className="tk-sheen group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]"
                  >
                    <div className="tk-tilt-layer flex items-start justify-between gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon size={21} />
                      </span>
                      <span className="shrink-0 rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                        {t("price.from")} {formatCAD(c.amount)}
                        <span className="font-medium text-muted-foreground">{t(cadenceKeys[c.cadence] as TranslationKey)}</span>
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-foreground">{t(`cat.${c.k}.title` as TranslationKey)}</h3>
                    <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{t(`cat.${c.k}.desc` as TranslationKey)}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-xs font-semibold uppercase tracking-wider text-primary">
                      {t("home.disc.explore")}
                      <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </TiltCard>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("home.disc.quick")}</span>
            {RAIL.map((r) => {
              const Icon = r.icon;
              return (
                <Link
                  key={r.k}
                  to={r.to as never}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] text-foreground/80 transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <Icon size={13} className="text-primary" />
                  {t(`cat.${r.k}.title` as TranslationKey)}
                </Link>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
