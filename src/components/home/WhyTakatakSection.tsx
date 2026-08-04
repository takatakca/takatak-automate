import { ShieldCheck, Users, Lock, Leaf, Layers, Headphones } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/lib/i18n";

const pillars: readonly { icon: LucideIcon; k: string }[] = [
  { icon: ShieldCheck, k: "p1" },
  { icon: Users,       k: "p2" },
  { icon: Lock,        k: "p3" },
  { icon: Leaf,        k: "p4" },
  { icon: Layers,      k: "p5" },
  { icon: Headphones,  k: "p6" },
];

export function WhyTakatakSection() {
  const { t } = useLanguage();
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("home.why.kicker")}</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-foreground md:text-4xl">{t("home.why.title")}</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{t("home.why.subtitle")}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.k} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{t(`home.why.${p.k}.title` as TranslationKey)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`home.why.${p.k}.desc` as TranslationKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
