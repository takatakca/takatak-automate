import { Activity, FolderKanban, Files, Inbox, LayoutDashboard, PackageCheck } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { DELIVERY_STAGES } from "@/lib/deliveryStages";
import { StagePanel } from "./stagePanels";

const NAV = [
  { icon: LayoutDashboard, label: { en: "Overview", fr: "Aperçu" } },
  { icon: FolderKanban, label: { en: "Project", fr: "Projet" } },
  { icon: Files, label: { en: "Files", fr: "Fichiers" } },
  { icon: Inbox, label: { en: "Messages", fr: "Messages" } },
  { icon: PackageCheck, label: { en: "Deliveries", fr: "Livraisons" } },
  { icon: Activity, label: { en: "Activity", fr: "Activité" } },
] as const;

/**
 * Illustrative TAKATAK project workspace. The frame stays constant while the
 * seven delivery stages change its content — a demonstration, not live data.
 */
export function ProjectWorkspace({ index, beat }: { index: number; beat: number }) {
  const { tx } = useLanguage();
  const stage = DELIVERY_STAGES[index]!;
  const progress = ((index + 1) / DELIVERY_STAGES.length) * 100;

  return (
    <div
      id="tk-journey-workspace"
      role="tabpanel"
      aria-labelledby={`tk-stage-tab-${stage.key}`}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_40px_90px_-56px_rgba(0,0,0,0.55)]"
    >
      <div className="flex">
        {/* Sidebar — desktop only */}
        <aside aria-hidden className="hidden w-40 shrink-0 border-r border-border bg-secondary/40 p-3 lg:block">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">TAKATAK</p>
          <ul className="mt-3 space-y-0.5">
            {NAV.map((n, i) => {
              const Icon = n.icon;
              return (
                <li key={n.label.en}>
                  <span
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] ${
                      i === 1 ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon size={13} />
                    {tx(n.label)}
                  </span>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Project header */}
          <div className="border-b border-border px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {tx({ en: "Project", fr: "Projet" })}
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {tx({ en: "Business website", fr: "Site web d'affaires" })}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                {tx(stage.status)}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span aria-hidden className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                <span
                  className="block h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </span>
              <span className="text-[11px] text-muted-foreground">
                {tx({ en: "Stage", fr: "Étape" })} {stage.n} · {tx(stage.name)}
              </span>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <StagePanel key={stage.key} stageKey={stage.key} beat={beat} />
          </div>
        </div>
      </div>
    </div>
  );
}
