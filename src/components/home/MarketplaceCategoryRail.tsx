import { Link } from "@tanstack/react-router";
import {
  Globe2, Palette, Smartphone, Server, Megaphone, Share2, MapPin,
  Target, PhoneCall, Workflow, ClipboardList, Utensils, Rocket, ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/lib/i18n";
import { pricing, formatCAD, cadenceKeys, type Cadence } from "@/lib/pricing";
import { Reveal } from "./Reveal";

interface Cat { icon: LucideIcon; k: string; to: string; amount?: number; cadence?: Cadence }

const CATEGORIES: readonly Cat[] = [
  { icon: Rocket,        k: "websites",   to: "/services/websites",                    amount: pricing.websites[0].amount,     cadence: "one-time" },
  { icon: Globe2,        k: "domains",    to: "/domain",                               amount: pricing.domain.register.amount, cadence: "yearly" },
  { icon: Server,        k: "hosting",    to: "/hosting",                              amount: pricing.hosting[0].amount,      cadence: "monthly" },
  { icon: Palette,       k: "branding",   to: "/marketplace/category/logo_design",     amount: pricing.branding[0].amount,     cadence: "one-time" },
  { icon: Smartphone,    k: "apps",       to: "/services/mobile-apps",                 amount: pricing.apps[0].amount,         cadence: "one-time" },
  { icon: Megaphone,     k: "marketing",  to: "/services/marketing",                   amount: pricing.marketing[0].amount,    cadence: "one-time" },
  { icon: Share2,        k: "social",     to: "/services/social-media",                amount: pricing.social[0].amount,       cadence: "monthly" },
  { icon: MapPin,        k: "local",      to: "/services/local-listings",              amount: pricing.local[0].amount,        cadence: "one-time" },
  { icon: Target,        k: "leads",      to: "/services/lead-generation",             amount: pricing.leads[0].amount,        cadence: "one-time" },
  { icon: PhoneCall,     k: "voip",       to: "/services/voip",                        amount: pricing.voip[0].amount,         cadence: "monthly" },
  { icon: Workflow,      k: "automation", to: "/services/ai-business-tools",           amount: pricing.ai[0].amount,           cadence: "one-time" },
  { icon: ClipboardList, k: "data",       to: "/marketplace/category/data_entry" },
  { icon: Utensils,      k: "print",      to: "/marketplace/gigs/menu-design",         amount: pricing.design[0].amount,       cadence: "one-time" },
];

export function MarketplaceCategoryRail() {
  const { t } = useLanguage();
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <Reveal>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("home.rail.title")}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{t("home.rail.subtitle")}</p>
            </div>
            <Link to="/services" className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              {t("home.rail.all")} <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>

        <ul className="mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal as="li" key={c.k} delay={Math.min(i, 7) * 45} className="w-[248px] shrink-0 snap-start sm:w-auto">
                <Link
                  to={c.to as never}
                  className="tk-sheen group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon size={19} />
                    </span>
                    {c.amount != null && c.cadence && (
                      <span className="shrink-0 rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                        {t("price.from")} {formatCAD(c.amount)}
                        <span className="font-medium text-muted-foreground">{t(cadenceKeys[c.cadence] as TranslationKey)}</span>
                      </span>
                    )}
                  </div>
                  <span className="mt-4 text-[15px] font-semibold text-foreground">{t(`cat.${c.k}.title` as TranslationKey)}</span>
                  <span className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{t(`cat.${c.k}.desc` as TranslationKey)}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-semibold uppercase tracking-wider text-primary">
                    {t("home.rail.explore")}
                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
