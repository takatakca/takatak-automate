import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/hooks/useLanguage";
import type { ConciergeGoal } from "@/lib/conciergeGoals";

/**
 * Business solution visualization: the selected goal illuminates one
 * pathway through existing TAKATAK services.
 */
export function SolutionPathway({ goal, beat }: { goal: ConciergeGoal; beat: number }) {
  const { tx } = useLanguage();
  const Icon = goal.icon;

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-sm md:p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <Icon size={15} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            {tx({ en: "Recommended pathway", fr: "Parcours recommandé" })}
          </p>
          <p className="truncate text-sm font-semibold text-foreground">{tx(goal.option)}</p>
        </div>
      </div>

      <ol className="mt-4 space-y-2">
        {goal.steps.map((step, i) => {
          const on = beat >= i;
          return (
            <li
              key={step.label.en}
              className={`relative flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-500 ${
                on
                  ? "border-primary/35 bg-primary/[0.07] opacity-100 translate-y-0"
                  : "border-border bg-secondary/30 opacity-60 translate-y-1"
              }`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-bold transition-colors ${
                  on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-foreground">{tx(step.label)}</span>
                <span className="block truncate text-[11.5px] text-muted-foreground">{tx(step.note)}</span>
              </span>
              {i < goal.steps.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute -bottom-2 left-6 h-2 w-px transition-colors ${on ? "bg-primary/50" : "bg-border"}`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {tx({ en: "Services involved", fr: "Services concernés" })}
      </p>
      <ul className="mt-2 grid gap-2">
        {goal.recommended.map((rec) => {
          const inner = (
            <>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-foreground">{rec.name}</span>
                <span className="block truncate text-[11.5px] text-muted-foreground">{tx(rec.blurb)}</span>
              </span>
              {rec.href ? (
                <ExternalLink size={13} className="shrink-0 text-primary" aria-hidden />
              ) : (
                <ArrowRight size={13} className="shrink-0 text-primary" aria-hidden />
              )}
            </>
          );
          const cls =
            "flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 transition-colors hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
          return (
            <li key={rec.name}>
              {rec.href ? (
                <a href={rec.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <Link to={rec.to as never} className={cls}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
