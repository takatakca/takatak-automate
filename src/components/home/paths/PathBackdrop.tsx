import { useLanguage } from "@/hooks/useLanguage";
import { BUSINESS_PATHS, type PathKey } from "@/lib/businessPaths";

const LIGHTING: Record<PathKey, string> = {
  launch:
    "radial-gradient(900px 520px at 20% 6%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%), radial-gradient(760px 460px at 88% 92%, color-mix(in oklab, var(--brand-dark-2) 92%, transparent), transparent 74%)",
  grow:
    "radial-gradient(920px 520px at 74% 4%, color-mix(in oklab, var(--brand-accent-cyan, var(--primary)) 20%, transparent), transparent 70%), radial-gradient(780px 480px at 14% 88%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 72%)",
  operate:
    "radial-gradient(1040px 560px at 50% 102%, color-mix(in oklab, var(--primary) 17%, transparent), transparent 70%), radial-gradient(720px 420px at 8% 0%, color-mix(in oklab, var(--brand-dark-2) 96%, transparent), transparent 76%)",
};

/**
 * One designed environment for the three business paths: perspective
 * infrastructure grid, directional pathways, lighting and the recessed
 * environmental word. Only the active path is brought forward.
 */
export function PathBackdrop({ path }: { path: PathKey }) {
  const { tx } = useLanguage();
  const activeIndex = BUSINESS_PATHS.findIndex((p) => p.key === path);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 transition-[background] duration-700" style={{ background: LIGHTING[path] }} />

      {/* Perspective infrastructure floor. */}
      <div className="absolute inset-x-0 bottom-0 h-[52%] [perspective:900px]">
        <div
          className="tk-grid-drift absolute inset-0 origin-bottom opacity-[0.16]"
          style={{
            transform: "rotateX(64deg)",
            backgroundImage:
              "linear-gradient(var(--brand-dark-border) 1px, transparent 1px), linear-gradient(90deg, var(--brand-dark-border) 1px, transparent 1px)",
            backgroundSize: path === "operate" ? "40px 40px" : "72px 72px",
            maskImage: "linear-gradient(to top, black 5%, transparent 92%)",
          }}
        />
      </div>

      {/* Directional pathways continuing from the foundation section. */}
      <svg className="absolute inset-x-0 top-0 h-40 w-full text-primary/50" viewBox="0 0 1200 160" preserveAspectRatio="none">
        <path d="M 600 0 C 600 60, 240 70, 220 160" fill="none" stroke="currentColor" strokeOpacity={activeIndex === 0 ? 0.5 : 0.14} strokeWidth={1.2} />
        <path d="M 600 0 L 600 160" fill="none" stroke="currentColor" strokeOpacity={activeIndex === 1 ? 0.5 : 0.14} strokeWidth={1.2} />
        <path d="M 600 0 C 600 60, 960 70, 980 160" fill="none" stroke="currentColor" strokeOpacity={activeIndex === 2 ? 0.5 : 0.14} strokeWidth={1.2} />
      </svg>

      {/* Environmental typography — depth, never a competing heading. */}
      <div className="absolute inset-0 flex items-center justify-center">
        {BUSINESS_PATHS.map((p) => (
          <span
            key={p.key}
            className="absolute select-none whitespace-nowrap text-[26vw] font-black leading-none tracking-tighter text-foreground transition-all duration-700 md:text-[16vw]"
            style={{
              opacity: p.key === path ? 0.07 : 0,
              transform: p.key === path ? "none" : "scale(1.06)",
            }}
          >
            {tx(p.word)}
          </span>
        ))}
      </div>
    </div>
  );
}
