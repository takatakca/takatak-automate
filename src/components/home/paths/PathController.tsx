import { useLanguage } from "@/hooks/useLanguage";
import { BUSINESS_PATHS, type PathKey } from "@/lib/businessPaths";

/**
 * 01 / 02 / 03 business-path controller. Semantic tabs with a shared
 * progress line; inactive paths stay visible, quieter and clickable.
 */
export function PathController({
  current,
  onSelect,
}: {
  current: PathKey;
  onSelect: (key: PathKey) => void;
}) {
  const { tx } = useLanguage();
  const activeIndex = BUSINESS_PATHS.findIndex((p) => p.key === current);

  return (
    <div
      role="tablist"
      aria-label={tx({ en: "TAKATAK business paths", fr: "Parcours d'affaires TAKATAK" })}
      aria-orientation="horizontal"
      className="relative grid grid-cols-3 gap-1.5 sm:gap-3"
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-[14%] top-1/2 hidden h-px -translate-y-1/2 bg-white/12 sm:block" />
      <span
        aria-hidden
        className="pointer-events-none absolute left-[14%] top-1/2 hidden h-px -translate-y-1/2 bg-primary/70 transition-all duration-500 sm:block"
        style={{ width: `${(activeIndex / 2) * 72}%` }}
      />
      {BUSINESS_PATHS.map((p, i) => {
        const selected = p.key === current;
        return (
          <button
            key={p.key}
            type="button"
            role="tab"
            id={`tk-path-tab-${p.key}`}
            aria-selected={selected}
            aria-controls="tk-path-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(p.key)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const next = (i + (e.key === "ArrowRight" ? 1 : -1) + BUSINESS_PATHS.length) % BUSINESS_PATHS.length;
              onSelect(BUSINESS_PATHS[next]!.key);
              document.getElementById(`tk-path-tab-${BUSINESS_PATHS[next]!.key}`)?.focus();
            }}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-2xl border px-2.5 py-3 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:gap-3 sm:px-5 ${
              selected
                ? "-translate-y-0.5 border-primary/55 bg-primary/12 shadow-[0_26px_64px_-40px_rgba(0,0,0,0.95)]"
                : "border-white/12 bg-white/[0.03] opacity-75 hover:opacity-100"
            }`}
          >
            <span
              className={`font-black leading-none tabular-nums transition-all duration-500 ${
                selected ? "text-2xl text-primary sm:text-3xl" : "text-base text-muted-foreground sm:text-lg"
              }`}
            >
              0{i + 1}
            </span>
            <span
              className={`truncate text-[10px] font-semibold uppercase tracking-[0.06em] sm:tracking-[0.16em] sm:text-xs ${
                selected ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {tx(p.name)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
