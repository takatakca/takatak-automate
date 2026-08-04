import { Layers, Wrench, Sparkles, MapPin, Bot, Receipt, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/lib/i18n";
import { Reveal } from "./Reveal";

const pillars: readonly { icon: LucideIcon; k: string }[] = [
  { icon: Layers,  k: "p1" },
  { icon: Wrench,  k: "p2" },
  { icon: Sparkles, k: "p3" },
  { icon: MapPin,  k: "p4" },
  { icon: Bot,     k: "p5" },
  { icon: Receipt, k: "p6" },
];

export function WhyTakatakSection() {
  const { t } = useLanguage();
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("home.why.kicker")}</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-foreground md:text-4xl">{t("home.why.title")}</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{t("home.why.subtitle")}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.k} delay={i * 60}>
                <div className="tk-sheen group h-full rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{t(`home.why.${p.k}.title` as TranslationKey)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`home.why.${p.k}.desc` as TranslationKey)}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <ArrowRight size={14} /> {t(`home.why.${p.k}.outcome` as TranslationKey)}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
