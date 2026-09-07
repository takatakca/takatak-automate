/** Decorative cinematic environment for the closing section. */
export function ClosingBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(900px 420px at 18% -10%, color-mix(in oklab, var(--brand-accent-cyan) 16%, transparent), transparent 65%), radial-gradient(760px 420px at 88% 110%, color-mix(in oklab, var(--brand-accent-violet) 14%, transparent), transparent 62%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[70%] opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to top, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 44px",
          color: "var(--brand-accent-cyan)",
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
          transform: "perspective(700px) rotateX(58deg)",
          transformOrigin: "bottom",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--brand-accent-cyan), var(--brand-accent-violet), transparent)",
        }}
      />
    </div>
  );
}
