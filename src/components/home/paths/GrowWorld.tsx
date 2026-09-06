import { ExternalLink, MapPin, Megaphone, Target, User } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { externalLinkProps, FLEXS, QMAPS } from "@/lib/productDestinations";
import { Beat, SceneLabel, SceneSurface, WorldStatus } from "./pathParts";

/**
 * GROW world — visibility → discovery → interest → opportunity.
 * QMAPS carries local visibility, FLEXS carries the opportunity pipeline;
 * both keep their canonical product links.
 */
export function GrowWorld({ beat, status }: { beat: number; status: string }) {
  const { tx } = useLanguage();

  return (
    <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
      {/* Local map field */}
      <Beat show={beat >= 2} from="scale" className="absolute inset-x-0 bottom-0 top-[18%]">
        <SceneSurface depth="back" className="relative h-full overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(var(--brand-dark-border) 1px, transparent 1px), linear-gradient(90deg, var(--brand-dark-border) 1px, transparent 1px)",
              backgroundSize: "38px 38px",
              maskImage: "radial-gradient(ellipse at 50% 45%, black 25%, transparent 85%)",
            }}
          />
          <svg aria-hidden className="absolute inset-0 h-full w-full text-primary" viewBox="0 0 400 220" preserveAspectRatio="none">
            <path d="M 0 150 L 400 120" fill="none" stroke="currentColor" strokeOpacity={0.16} strokeWidth={6} />
            <path d="M 130 0 L 170 220" fill="none" stroke="currentColor" strokeOpacity={0.14} strokeWidth={5} />
            <path
              d="M 150 96 C 210 96, 230 150, 300 150"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeOpacity={beat >= 5 ? 0.65 : 0.15}
              style={{ transition: "stroke-opacity 500ms" }}
            />
          </svg>
        </SceneSurface>
      </Beat>

      {/* Campaign surface */}
      <Beat show={beat >= 1} from="down" className="absolute left-0 top-0 w-[56%] max-w-[240px]">
        <SceneSurface depth="mid" className="px-3 py-2.5">
          <SceneLabel>{tx({ en: "Campaign", fr: "Campagne" })}</SceneLabel>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Megaphone size={14} className="text-primary" aria-hidden />
            {tx({ en: "Marketing live", fr: "Marketing en ligne" })}
          </p>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <span className="block h-full rounded-full bg-primary/70 transition-all duration-700" style={{ width: beat >= 1 ? "72%" : "8%" }} />
          </div>
        </SceneSurface>
      </Beat>

      {/* QMAPS business location */}
      <Beat show={beat >= 3} from="scale" className="absolute left-[8%] top-[38%] w-[46%] max-w-[210px]">
        <SceneSurface depth="front" className="px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <SceneLabel>{tx({ en: "Local visibility", fr: "Visibilité locale" })}</SceneLabel>
            <a
              href={QMAPS.productUrl}
              {...externalLinkProps}
              aria-label={tx({ en: "Open the QMAPS product site", fr: "Ouvrir le site du produit QMAPS" })}
              className="inline-flex items-center gap-1 rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-foreground hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              QMAPS <ExternalLink size={10} aria-hidden />
            </a>
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin size={14} className="text-primary" aria-hidden />
            {tx({ en: "Business listed", fr: "Entreprise répertoriée" })}
          </p>
        </SceneSurface>
      </Beat>

      {/* Customer discovery */}
      <Beat show={beat >= 4} from="up" className="absolute bottom-[26%] left-[40%]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-foreground">
          <User size={12} className="text-primary" aria-hidden />
          {tx({ en: "Customer discovers you", fr: "Un client vous découvre" })}
        </span>
      </Beat>

      {/* FLEXS opportunity */}
      <Beat show={beat >= 6} from="right" className="absolute bottom-[10%] right-0 w-[54%] max-w-[240px]">
        <SceneSurface depth="front" className="px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <SceneLabel>{tx({ en: "Opportunity", fr: "Occasion" })}</SceneLabel>
            <a
              href={FLEXS.productUrl}
              {...externalLinkProps}
              aria-label={tx({ en: "Open the FLEXS product site", fr: "Ouvrir le site du produit FLEXS" })}
              className="inline-flex items-center gap-1 rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-foreground hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              FLEXS <ExternalLink size={10} aria-hidden />
            </a>
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target size={14} className="text-primary" aria-hidden />
            {tx({ en: "New request received", fr: "Nouvelle demande reçue" })}
          </p>
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-500"
                style={{ background: beat >= 7 - i ? "color-mix(in oklab, var(--primary) 75%, transparent)" : "rgba(255,255,255,0.12)" }}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            {tx({ en: "Pipeline: new → contacted → won", fr: "Pipeline : nouveau → contacté → gagné" })}
          </p>
        </SceneSurface>
      </Beat>

      <WorldStatus show={beat >= 8} label={status} />
    </div>
  );
}
