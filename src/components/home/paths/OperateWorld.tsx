import { Activity, Bell, CheckCircle2, Cpu, ListChecks, PhoneCall, Workflow } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Beat, SceneLabel, SceneSurface, WorldStatus } from "./pathParts";

/**
 * OPERATE world — a demonstration TAKATAK operations workspace. Illustrative
 * interface only: no live or real customer data is shown.
 */
export function OperateWorld({ beat, status }: { beat: number; status: string }) {
  const { tx } = useLanguage();

  const nav = [
    { icon: Activity, label: { en: "Activity", fr: "Activité" } },
    { icon: PhoneCall, label: { en: "Calls", fr: "Appels" } },
    { icon: Workflow, label: { en: "Automations", fr: "Automatisations" } },
    { icon: ListChecks, label: { en: "Tasks", fr: "Tâches" } },
    { icon: Cpu, label: { en: "Services", fr: "Services" } },
  ];

  return (
    <div className="relative aspect-[5/6] w-full sm:aspect-[16/10]">
      <SceneSurface depth="mid" className="absolute inset-0 overflow-hidden">
        <div className="grid h-full grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)]">
          {/* Sidebar */}
          <div className="hidden border-r border-white/10 bg-white/[0.02] p-2 sm:block sm:p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary">TAKATAK</p>
            <ul className="mt-3 space-y-1.5">
              {nav.map((n, i) => {
                const Icon = n.icon;
                const on = beat >= 4 && i === 2;
                return (
                  <li
                    key={n.label.en}
                    className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] transition-colors duration-500 sm:text-[11px] ${
                      on ? "bg-primary/12 text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Icon size={11} className={on ? "text-primary" : ""} aria-hidden />
                    <span className="truncate">{tx(n.label)}</span>
                  </li>
                );
              })}
            </ul>

            <SceneLabel>{tx({ en: "Service status", fr: "Statut des services" })}</SceneLabel>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {[
                { en: "Phone line", fr: "Ligne téléphonique" },
                { en: "Automations", fr: "Automatisations" },
                { en: "AI tools", fr: "Outils IA" },
              ].map((svc, i) => (
                <span
                  key={svc.en}
                  className={`flex items-center gap-1.5 rounded-md border px-1.5 py-1 text-[9px] transition-colors duration-500 sm:text-[10px] ${
                    beat >= 8 ? "border-primary/35 bg-primary/10 text-foreground" : "border-white/10 bg-white/[0.03] text-muted-foreground"
                  }`}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500"
                    style={{ background: beat >= 8 - i ? "color-mix(in oklab, var(--primary) 80%, transparent)" : "rgba(255,255,255,0.2)" }}
                  />
                  <span className="truncate">{tx(svc)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Main surface */}
          <div className="space-y-2 p-3 pt-14 sm:p-4 sm:pt-4">
            <SceneLabel>{tx({ en: "Active workflow", fr: "Automatisation active" })}</SceneLabel>
            <div className="flex items-center gap-1.5">
              {[
                { en: "Call", fr: "Appel" },
                { en: "Qualify", fr: "Qualifier" },
                { en: "Task", fr: "Tâche" },
                { en: "Notify", fr: "Notifier" },
              ].map((n, i) => (
                <div key={n.en} className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span
                    className={`min-w-0 flex-1 truncate rounded-md border px-1.5 py-1 text-center text-[9px] font-semibold transition-all duration-500 sm:text-[10px] ${
                      beat >= 4 + i
                        ? "border-primary/45 bg-primary/12 text-foreground"
                        : "border-white/12 bg-white/[0.03] text-muted-foreground"
                    }`}
                  >
                    {tx(n)}
                  </span>
                  {i < 3 && <span className="h-px w-2 shrink-0 bg-white/20" />}
                </div>
              ))}
            </div>

            <SceneLabel>{tx({ en: "Recent activity", fr: "Activité récente" })}</SceneLabel>
            <ul className="space-y-1.5">
              {[
                { show: beat >= 2, en: "Call routed to the right team", fr: "Appel acheminé à la bonne équipe" },
                { show: beat >= 6, en: "Task completed automatically", fr: "Tâche complétée automatiquement" },
                { show: beat >= 8, en: "Service status updated", fr: "Statut des services mis à jour" },
              ].map((row) => (
                <li key={row.en}>
                  <Beat show={row.show} from="up">
                    <span className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] text-foreground/85 sm:text-[11px]">
                      <CheckCircle2 size={11} className="shrink-0 text-primary" aria-hidden />
                      <span className="truncate">{tx(row)}</span>
                    </span>
                  </Beat>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SceneSurface>

      {/* Foreground: incoming call */}
      <Beat show={beat >= 1} from="left" className="absolute left-1 top-1 w-[49%] max-w-[190px] sm:-left-1 sm:top-[16%] sm:w-[52%]">
        <SceneSurface depth="front" className="px-2.5 py-2">
          <p className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
            <PhoneCall size={12} className="text-primary" aria-hidden />
            {tx({ en: "Incoming call", fr: "Appel entrant" })}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {tx({ en: "Business line · demonstration", fr: "Ligne d'affaires · démonstration" })}
          </p>
        </SceneSurface>
      </Beat>

      {/* Foreground: team notification */}
      <Beat show={beat >= 7} from="right" className="absolute right-1 top-1 w-[47%] max-w-[190px] sm:top-[8%] sm:w-[50%]">
        <SceneSurface depth="front" className="px-2.5 py-2">
          <p className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
            <Bell size={12} className="text-primary" aria-hidden />
            {tx({ en: "Team notified", fr: "Équipe notifiée" })}
          </p>
        </SceneSurface>
      </Beat>

      <WorldStatus show={beat >= 8} label={status} />
    </div>
  );
}
