import { useLanguage } from "@/hooks/useLanguage";

/**
 * Premium consultation environment: graphite architecture, soft emerald
 * lighting, a faint technical grid and recessed environmental typography.
 * Purely decorative.
 */
export function ConciergeBackdrop() {
  const { tx } = useLanguage();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(900px_460px_at_12%_-10%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_95%_105%,color-mix(in_oklab,var(--brand-accent-cyan)_10%,transparent),transparent_70%)]" />
      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(80% 70% at 40% 30%, #000 35%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(80% 70% at 40% 30%, #000 35%, transparent 100%)",
        }}
      />
      <span className="absolute -right-4 bottom-6 select-none text-[14vw] font-black leading-none tracking-tighter text-foreground/[0.035] md:text-[10vw]">
        {tx({ en: "CONCIERGE", fr: "CONCIERGERIE" })}
      </span>
    </div>
  );
}
