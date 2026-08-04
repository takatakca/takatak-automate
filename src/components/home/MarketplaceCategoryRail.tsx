import { Link } from "@tanstack/react-router";
import {
  Globe2, Palette, Smartphone, Server, Megaphone, Share2, MapPin,
  Target, PhoneCall, Workflow, ClipboardList, Utensils, Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/lib/i18n";

interface Cat { icon: LucideIcon; k: string; to: string }

const CATEGORIES: readonly Cat[] = [
  { icon: Rocket,        k: "websites",   to: "/services/websites" },
  { icon: Palette,       k: "branding",   to: "/marketplace/category/logo_design" },
  { icon: Smartphone,    k: "apps",       to: "/services/mobile-apps" },
  { icon: Globe2,        k: "domains",    to: "/domain" },
  { icon: Server,        k: "hosting",    to: "/hosting" },
  { icon: Megaphone,     k: "marketing",  to: "/services/marketing" },
  { icon: Share2,        k: "social",     to: "/services/social-media" },
  { icon: MapPin,        k: "local",      to: "/services/local-listings" },
  { icon: Target,        k: "leads",      to: "/services/lead-generation" },
  { icon: PhoneCall,     k: "voip",       to: "/services/voip" },
  { icon: Workflow,      k: "automation", to: "/services/ai-business-tools" },
  { icon: ClipboardList, k: "data",       to: "/marketplace/category/data_entry" },
  { icon: Utensils,      k: "print",      to: "/marketplace/category/menu_design" },
];

export function MarketplaceCategoryRail() {
  const { t } = useLanguage();
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground md:text-2xl">{t("home.rail.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("home.rail.subtitle")}</p>
          </div>
          <Link to="/services" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            {t("home.rail.all")}
          </Link>
        </div>

        <ul className="mt-6 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.k} className="w-[230px] shrink-0 sm:w-auto">
                <Link
                  to={c.to as never}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[var(--shadow-card)]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={18} />
                  </span>
                  <span className="mt-3 text-sm font-semibold text-foreground">{t(`cat.${c.k}.title` as TranslationKey)}</span>
                  <span className="mt-1 text-xs leading-5 text-muted-foreground">{t(`cat.${c.k}.desc` as TranslationKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
