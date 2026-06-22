const ITEMS = [
  "10% off your first TAKATAK service",
  "Websites, logos, hosting, marketing and business tools",
  "Managed delivery through TAKATAK",
  "QMAPS local visibility",
  "FLEXS lead generation",
  "Secure project workspace",
  "Human-managed quality control",
];

export function PromoMarquee() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="border-y border-border bg-card/40 overflow-hidden">
      <div
        className="flex gap-12 py-3 whitespace-nowrap text-sm"
        style={{ animation: "promoMarquee 60s linear infinite" }}
      >
        {loop.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
            {t}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes promoMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}