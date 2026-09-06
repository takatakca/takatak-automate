import { Globe, Server, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Beat, SceneLabel, SceneSurface, WorldStatus } from "./pathParts";

/**
 * LAUNCH world — business identity → domain → hosting → website →
 * professional presence. A higher-level launch presentation, not a copy of
 * the Foundation Workspace.
 */
export function LaunchWorld({ beat, status }: { beat: number; status: string }) {
  const { tx } = useLanguage();

  return (
    <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
      {/* Infrastructure line */}
      <svg aria-hidden className="absolute inset-0 h-full w-full text-primary" viewBox="0 0 400 250" preserveAspectRatio="none">
        <path
          d="M 70 58 C 150 58, 150 120, 210 120"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeOpacity={beat >= 2 ? 0.6 : 0.15}
          style={{ transition: "stroke-opacity 500ms" }}
        />
      </svg>

      {/* Domain surface */}
      <Beat show={beat >= 1} className="absolute left-0 top-2 w-[58%] max-w-[260px]">
        <SceneSurface depth="mid" className="px-3 py-2.5">
          <SceneLabel>{tx({ en: "Domain", fr: "Domaine" })}</SceneLabel>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Globe size={14} className="text-primary" aria-hidden />
            votreentreprise.ca
          </p>
        </SceneSurface>
      </Beat>

      {/* Hosting / infrastructure layer */}
      <Beat show={beat >= 2} from="left" className="absolute bottom-6 left-0 w-[46%] max-w-[210px]">
        <SceneSurface depth="back" className="px-3 py-2.5">
          <SceneLabel>{tx({ en: "Hosting", fr: "Hébergement" })}</SceneLabel>
          <p className="mt-1 flex items-center gap-2 text-xs text-foreground/85">
            <Server size={13} className="text-primary" aria-hidden />
            {tx({ en: "Managed · SSL · backups", fr: "Géré · SSL · sauvegardes" })}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1 rounded-full bg-primary/50" style={{ opacity: beat >= 2 + i * 0 ? 1 : 0.2 }} />
            ))}
          </div>
        </SceneSurface>
      </Beat>

      {/* Browser */}
      <Beat show={beat >= 3} from="scale" className="absolute right-0 top-6 w-[62%] max-w-[330px]">
        <SceneSurface depth="front" className="overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-white/25" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="ml-2 truncate rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-muted-foreground">
              https://votreentreprise.ca
            </span>
          </div>
          <div className="space-y-2 p-3">
            <div className="h-14 rounded-lg bg-[linear-gradient(120deg,color-mix(in_oklab,var(--primary)_28%,transparent),transparent)]" />
            <div className="h-2 w-2/3 rounded-full bg-white/15" />
            <div className="h-2 w-1/2 rounded-full bg-white/10" />
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-8 rounded-md border border-white/10 bg-white/[0.04]" />
              ))}
            </div>
          </div>
        </SceneSurface>
      </Beat>

      {/* Mobile version */}
      <Beat show={beat >= 4} from="up" className="absolute bottom-2 right-[16%] w-[74px]">
        <SceneSurface depth="front" className="overflow-hidden p-1.5">
          <div className="h-6 rounded-sm bg-[linear-gradient(120deg,color-mix(in_oklab,var(--primary)_30%,transparent),transparent)]" />
          <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-white/15" />
          <div className="mt-1 h-1.5 w-1/2 rounded-full bg-white/10" />
        </SceneSurface>
      </Beat>

      {/* Brand mark */}
      <Beat show={beat >= 5} from="scale" className="absolute bottom-[34%] right-[6%]">
        <span className="inline-flex items-center gap-2 rounded-xl border border-primary/35 bg-primary/12 px-2.5 py-1.5 text-[11px] font-semibold text-foreground">
          <Sparkles size={12} className="text-primary" aria-hidden />
          {tx({ en: "Brand applied", fr: "Marque appliquée" })}
        </span>
      </Beat>

      <WorldStatus show={beat >= 6} label={status} />
    </div>
  );
}
