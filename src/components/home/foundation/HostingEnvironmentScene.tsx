import { Lock, ShoppingCart, Layers, Server, Globe2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Qualitative capability per plan — never a fabricated technical spec. */
const RACKS: Record<string, number> = { portfolio: 1, bronze: 2, silver: 3, gold: 4 };

/**
 * One technical hosting environment that transforms as the plan changes:
 * a browser surface plus a server architecture that becomes more capable.
 * Decorative; the readable facts live in the plan detail panel.
 */
export function HostingEnvironmentScene({ planKey, domain }: { planKey: string; domain?: string | null }) {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  const racks = RACKS[planKey] ?? 1;

  const chips: { icon: typeof Lock; key: string }[] = [
    { icon: Globe2, key: "fnd.scene.site" },
    ...(racks >= 2 ? [{ icon: Lock, key: "fnd.scene.ssl" }] : []),
    ...(racks >= 3 ? [{ icon: Layers, key: "fnd.scene.services" }] : []),
    ...(racks >= 4 ? [{ icon: ShoppingCart, key: "fnd.scene.commerce" }] : []),
  ];

  return (
    <div aria-hidden className="tk-scene relative overflow-hidden rounded-2xl border border-border bg-background/70 p-4">
      <div className={reduced ? "" : "transition-all duration-300 ease-out"}>
        {/* Browser surface */}
        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span className="ml-2 min-w-0 truncate rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
              {domain ?? "yourbusiness.ca"}
            </span>
          </div>
          <div className="space-y-1.5 p-3">
            <span className="block h-2 rounded-full bg-primary/50" style={{ width: `${40 + racks * 12}%` }} />
            <span className="block h-1.5 w-full rounded-full bg-secondary" />
            <span className="block h-1.5 w-3/4 rounded-full bg-secondary" />
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {Array.from({ length: Math.min(3, racks) }).map((_, i) => (
                <span key={i} className="block h-6 rounded-md border border-border bg-secondary/60" />
              ))}
            </div>
          </div>
        </div>

        {/* Server architecture */}
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => {
            const on = i < racks;
            return (
              <span
                key={i}
                className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-all duration-300 ${
                  on ? "border-primary/40 bg-primary/10" : "border-border bg-background/60 opacity-50"
                }`}
              >
                <Server size={12} className={on ? "text-primary" : "text-muted-foreground"} />
                <span className="h-1 w-full rounded-full bg-current opacity-25" />
              </span>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map(({ icon: Icon, key }) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold text-foreground"
            >
              <Icon size={10} className="text-primary" /> {t(key as never)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
