import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { DELIVERY_STAGES } from "@/lib/deliveryStages";

/**
 * Project progression controller. Semantic tabs with keyboard arrows on
 * desktop; horizontally scrollable with prev/next controls on mobile.
 */
export function StageRail({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  const { tx } = useLanguage();
  const last = DELIVERY_STAGES.length - 1;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      onSelect(index >= last ? 0 : index + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      onSelect(index <= 0 ? last : index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      onSelect(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSelect(last);
    }
  };

  return (
    <div className="relative">
      <div
        role="tablist"
        aria-label={tx({ en: "Delivery stages", fr: "Étapes de livraison" })}
        onKeyDown={onKeyDown}
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-7 md:gap-2 md:overflow-visible md:px-0"
      >
        {DELIVERY_STAGES.map((s, i) => {
          const active = i === index;
          const done = i < index;
          return (
            <button
              key={s.key}
              type="button"
              role="tab"
              id={`tk-stage-tab-${s.key}`}
              aria-selected={active}
              aria-controls="tk-journey-workspace"
              tabIndex={active ? 0 : -1}
              onClick={() => onSelect(i)}
              className={`relative min-w-[132px] shrink-0 snap-start rounded-xl border px-3 py-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:min-w-0 ${
                active
                  ? "border-primary/45 bg-primary/[0.07] shadow-[var(--shadow-card)]"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] font-bold tracking-widest ${active ? "text-primary" : done ? "text-primary/70" : "text-muted-foreground"}`}
                >
                  {s.n}
                </span>
                {done && <Check size={11} className="text-primary/70" aria-hidden />}
              </span>
              <span className={`mt-0.5 block text-[13px] font-semibold ${active ? "text-foreground" : "text-foreground/80"}`}>
                {tx(s.name)}
              </span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-muted-foreground">{tx(s.trust)}</span>
              <span
                aria-hidden
                className={`absolute inset-x-3 bottom-0 h-px transition-opacity duration-300 ${active ? "bg-primary opacity-100" : "opacity-0"}`}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 md:hidden">
        <button
          type="button"
          onClick={() => onSelect(Math.max(0, index - 1))}
          disabled={index === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-40"
        >
          <ChevronLeft size={13} aria-hidden /> {tx({ en: "Previous", fr: "Précédent" })}
        </button>
        <span className="text-[11px] text-muted-foreground">
          {index + 1} / {DELIVERY_STAGES.length}
        </span>
        <button
          type="button"
          onClick={() => onSelect(Math.min(last, index + 1))}
          disabled={index === last}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-40"
        >
          {tx({ en: "Next", fr: "Suivant" })} <ChevronRight size={13} aria-hidden />
        </button>
      </div>
    </div>
  );
}
