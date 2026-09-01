import { useLanguage } from "@/hooks/useLanguage";

/**
 * Technical environment behind the TAKATAK foundation workspace: network
 * grid, DNS pathways, server architecture and the oversized environmental
 * word. Entirely decorative.
 */
export function FoundationBackdrop() {
  const { t } = useLanguage();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 40%, transparent 85%)",
        }}
      />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-[110px]" />
      <div
        className="absolute -right-24 bottom-0 h-80 w-80 rounded-full blur-[120px]"
        style={{ background: "color-mix(in oklab, var(--brand-accent-cyan, oklch(0.75 0.13 210)) 22%, transparent)" }}
      />

      <svg viewBox="0 0 1200 460" preserveAspectRatio="none" className="absolute inset-0 h-full w-full text-primary opacity-[0.18]">
        <path d="M 40 380 C 300 380, 300 140, 600 140 C 900 140, 900 360, 1160 360" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M 40 120 C 320 120, 320 330, 600 330 C 880 330, 880 150, 1160 150" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 12" />
        {[40, 320, 600, 880, 1160].map((x, i) => (
          <circle key={x} cx={x} cy={i % 2 === 0 ? 250 : 200} r="3.5" fill="currentColor" />
        ))}
      </svg>

      <span className="absolute -bottom-4 left-1/2 hidden -translate-x-1/2 select-none text-[14vw] font-black uppercase leading-none tracking-tight text-foreground/[0.035] md:block">
        {t("fnd.bgWord")}
      </span>
    </div>
  );
}
