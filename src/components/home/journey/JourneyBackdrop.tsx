import { useLanguage } from "@/hooks/useLanguage";

/**
 * Light architectural environment for the managed delivery journey: graphite
 * project grid, soft emerald directional light and oversized environmental
 * typography. Purely decorative.
 */
export function JourneyBackdrop() {
  const { tx } = useLanguage();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_520px_at_18%_-10%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_100%_110%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_70%)]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(85% 70% at 50% 30%, #000 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(85% 70% at 50% 30%, #000 40%, transparent 100%)",
        }}
      />
      <span className="absolute -right-6 top-10 select-none text-[16vw] font-black leading-none tracking-tighter text-foreground/[0.035] md:text-[12vw]">
        {tx({ en: "DELIVERY", fr: "LIVRAISON" })}
      </span>
      <span className="absolute bottom-6 left-4 select-none text-[10px] font-semibold uppercase tracking-[0.5em] text-foreground/20">
        {tx({ en: "Managed by TAKATAK", fr: "Encadré par TAKATAK" })}
      </span>
    </div>
  );
}
