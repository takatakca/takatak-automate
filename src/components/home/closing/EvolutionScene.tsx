import { Lightbulb, Globe, Network, LayoutDashboard, TrendingUp, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Bilingual } from "@/lib/i18n";

interface EvolutionStage {
  key: string;
  icon: LucideIcon;
  label: Bilingual;
  detail: Bilingual;
}

export const EVOLUTION_STAGES: readonly EvolutionStage[] = [
  {
    key: "idea",
    icon: Lightbulb,
    label: { en: "Idea", fr: "Idée" },
    detail: { en: "Your brief, understood", fr: "Votre besoin, compris" },
  },
  {
    key: "build",
    icon: Globe,
    label: { en: "Build", fr: "Construction" },
    detail: { en: "Domain, website, brand", fr: "Domaine, site, image" },
  },
  {
    key: "connect",
    icon: Network,
    label: { en: "Connect", fr: "Connexion" },
    detail: { en: "Visibility and marketing", fr: "Visibilité et marketing" },
  },
  {
    key: "operate",
    icon: LayoutDashboard,
    label: { en: "Operate", fr: "Opérations" },
    detail: { en: "One managed workspace", fr: "Un espace géré" },
  },
  {
    key: "growth",
    icon: TrendingUp,
    label: { en: "Growth", fr: "Croissance" },
    detail: { en: "A connected ecosystem", fr: "Un écosystème connecté" },
  },
] as const;

/**
 * Final digital evolution scene. `active` is the index illuminated by the
 * parent sequence; with reduced motion the parent pins it to the last stage.
 */
export function EvolutionScene({ active }: { active: number }) {
  const { tx } = useLanguage();

  return (
    <div className="relative rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-sm md:p-6">
      <div
        aria-hidden
        className="absolute left-8 right-8 top-[3.15rem] hidden h-px bg-border sm:block"
      >
        <span
          className="block h-px transition-all duration-700 ease-out"
          style={{
            width: `${(active / (EVOLUTION_STAGES.length - 1)) * 100}%`,
            background: "linear-gradient(90deg, var(--brand-accent-cyan), var(--brand-accent-violet))",
          }}
        />
      </div>

      <ol className="relative grid grid-cols-1 gap-3 sm:grid-cols-5 sm:gap-2">
        {EVOLUTION_STAGES.map((s, i) => {
          const on = i <= active;
          const current = i === active;
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-500 ${
                  on
                    ? "border-primary/50 bg-primary/12 text-primary"
                    : "border-border bg-secondary/40 text-muted-foreground"
                } ${current ? "scale-105 shadow-[0_0_0_5px_color-mix(in_oklab,var(--brand-accent-cyan)_12%,transparent)]" : ""}`}
              >
                <Icon size={16} aria-hidden />
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-[13px] font-semibold transition-colors duration-500 ${
                    on ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {tx(s.label)}
                </span>
                <span className="block text-[11.5px] leading-4 text-muted-foreground">{tx(s.detail)}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
