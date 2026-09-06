import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MotionViewport } from "@/components/motion/MotionViewport";
import { findPath, type PathKey } from "@/lib/businessPaths";
import { PathBackdrop } from "./PathBackdrop";
import { PathController } from "./PathController";
import { PathSalesPanel } from "./PathSalesPanel";
import { LaunchWorld } from "./LaunchWorld";
import { GrowWorld } from "./GrowWorld";
import { OperateWorld } from "./OperateWorld";

const BEAT_MS = 720;

/**
 * Pass 7 — TAKATAK business paths. One controller, one active world, one
 * sales panel: the visitor chooses how their business evolves next rather
 * than picking a plan from a row of pricing cards.
 */
export function BusinessPathsSection() {
  const { tx } = useLanguage();
  const reduced = useReducedMotion();
  const [key, setKey] = useState<PathKey>("launch");
  const path = findPath(key);

  return (
    <section
      aria-labelledby="tk-paths-title"
      className="brand-dark relative isolate overflow-hidden border-y border-border bg-[var(--brand-dark-2,#0b0f0e)]"
    >
      <PathBackdrop path={key} />

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        {/* Handoff from the foundation section. */}
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {tx({
              en: "Domain + hosting + website foundation",
              fr: "Fondation domaine + hébergement + site web",
            })}
          </span>
          <span aria-hidden className="my-3 h-8 w-px bg-gradient-to-b from-primary/70 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            {tx({ en: "TAKATAK business paths", fr: "Parcours d'affaires TAKATAK" })}
          </p>
          <h2 id="tk-paths-title" className="mt-2 text-3xl font-bold leading-tight text-foreground md:text-5xl">
            {tx({
              en: "Choose where your business goes next.",
              fr: "Choisissez la prochaine étape de votre entreprise.",
            })}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            {tx({
              en: "Three managed paths, one team. Start where your business needs TAKATAK most.",
              fr: "Trois parcours gérés, une seule équipe. Commencez là où votre entreprise en a le plus besoin.",
            })}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <PathController current={key} onSelect={setKey} />
        </div>

        <div
          id="tk-path-panel"
          role="tabpanel"
          aria-labelledby={`tk-path-tab-${key}`}
          className="mt-10 grid grid-cols-1 items-center gap-6 lg:grid-cols-[55fr_45fr] lg:gap-0"
        >
          <div className="relative lg:pr-10">
            <MotionViewport>
              {(active) => <PathWorld key={key} pathKey={key} active={active && !reduced} />}
            </MotionViewport>
          </div>
          <div className="relative z-10 lg:-ml-10">
            <PathSalesPanel path={path} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Runs the beat choreography for the active world only. */
function PathWorld({ pathKey, active }: { pathKey: PathKey; active: boolean }) {
  const { tx } = useLanguage();
  const path = findPath(pathKey);
  const [beat, setBeat] = useState(active ? 0 : path.beats);

  useEffect(() => {
    if (!active) {
      setBeat(path.beats);
      return;
    }
    setBeat(0);
    const id = window.setInterval(() => {
      setBeat((b) => (b >= path.beats ? b : b + 1));
    }, BEAT_MS);
    return () => window.clearInterval(id);
  }, [active, path.beats]);

  const status = tx(path.status);
  if (pathKey === "launch") return <LaunchWorld beat={beat} status={status} />;
  if (pathKey === "grow") return <GrowWorld beat={beat} status={status} />;
  return <OperateWorld beat={beat} status={status} />;
}
