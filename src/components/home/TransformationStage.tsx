import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { AnimatedStatus } from "@/components/motion/AnimatedStatus";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCAD, cadenceKeys, type Cadence } from "@/lib/pricing";
import type { TranslationKey } from "@/lib/i18n";
import type { TransformationStage as StageData } from "@/lib/transformationStages";

/**
 * One transformation stage: the animated visual story on the left, the
 * outcome and connected services on the right. `beat` is how many steps of
 * the story have played — it rests at the full length for static renders.
 */
export function TransformationStage({ stage, beat }: { stage: StageData; beat: number }) {
  const { t, tx } = useLanguage();

  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
      {/* Visual story */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm md:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(420px 220px at 15% 0%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 65%)",
          }}
        />
        <ol className="relative space-y-2.5">
          {stage.beats.map((b, i) => {
            const reached = beat > i;
            const current = beat === i + 1;
            return (
              <li
                key={b.label.en}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-500 ${
                  reached ? "border-primary/35 bg-primary/[0.07]" : "border-white/10 bg-white/[0.02] opacity-60"
                } ${current ? "translate-x-1" : ""}`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${
                    reached ? "border-primary/50 bg-primary/15 text-primary" : "border-white/15 text-muted-foreground"
                  }`}
                >
                  {reached ? <Check size={12} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground/90">{tx(b.label)}</span>
                {reached && <AnimatedStatus status={b.status} pulse={current} />}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Stage content */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{tx(stage.kicker)}</p>
        <h3 className="mt-3 text-2xl font-bold leading-tight text-foreground md:text-3xl">{tx(stage.headline)}</h3>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{tx(stage.outcome)}</p>

        <ul className="mt-6 grid grid-cols-2 gap-2">
          {stage.services.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.label.en}>
                <Link
                  to={s.to as never}
                  className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-[13px] font-medium text-foreground/90 transition-colors hover:border-primary/40 hover:bg-white/[0.08]"
                >
                  <Icon size={14} className="shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 truncate">{tx(s.label)}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-sm font-semibold text-foreground">
          {t("price.from")} {formatCAD(stage.amount)}
          <span className="font-medium text-muted-foreground">{t(cadenceKeys[stage.cadence as Cadence] as TranslationKey)}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={stage.primary.to as never}
            className="tk-glow-cta inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {tx(stage.primary.label)} <ArrowRight size={15} aria-hidden />
          </Link>
          <Link
            to={stage.secondary.to as never}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/10"
          >
            {tx(stage.secondary.label)}
          </Link>
        </div>
      </div>
    </div>
  );
}