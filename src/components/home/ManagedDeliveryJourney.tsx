import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquare } from "lucide-react";
import { MotionViewport } from "@/components/motion/MotionViewport";
import { Reveal } from "@/components/motion/Reveal";
import { useLanguage } from "@/hooks/useLanguage";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { openLiveChat } from "@/lib/chatProvider";
import { getPromoState, PROMO_CODE } from "@/lib/promotions";
import { DELIVERY_STAGES, TRUST_FOUNDATION } from "@/lib/deliveryStages";
import { JourneyBackdrop } from "./journey/JourneyBackdrop";
import { StageRail } from "./journey/StageRail";
import { ProjectWorkspace } from "./journey/ProjectWorkspace";

const BEAT_MS = 520;
const MAX_BEAT = 3;

/**
 * Pass 8 — Managed delivery journey. One illustrative TAKATAK project
 * workspace anchors seven managed stages, with trust embedded in the process.
 */
export function ManagedDeliveryJourney() {
  const { tx, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [promoSaved, setPromoSaved] = useState(false);

  useEffect(() => {
    const s = getPromoState();
    setPromoSaved(s.status === "claimed" || s.status === "pending");
  }, []);

  const stage = DELIVERY_STAGES[index]!;

  return (
    <section
      aria-labelledby="tk-journey-title"
      className="relative isolate overflow-hidden border-b border-border bg-background"
    >
      <JourneyBackdrop />

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            {tx({ en: "Managed delivery", fr: "Livraison encadrée" })}
          </p>
          <h2 id="tk-journey-title" className="mt-2 text-3xl font-bold leading-tight text-foreground md:text-4xl">
            {tx({
              en: "Know what happens next — from request to support.",
              fr: "Sachez toujours quelle est la prochaine étape.",
            })}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            {tx({
              en: "Every TAKATAK project moves through a clear managed process with review, approval and ongoing support.",
              fr: "Chaque projet TAKATAK suit un processus clair avec révision, approbation et soutien.",
            })}
          </p>
        </Reveal>

        <div className="mt-8">
          <StageRail index={index} onSelect={setIndex} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.9fr_0.9fr]">
          <MotionViewport>
            {(active) => <WorkspaceStage index={index} animate={active && !reduced} />}
          </MotionViewport>

          <aside className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{tx(stage.trust)}</p>
            <h3 className="mt-2 text-xl font-semibold leading-snug text-foreground">{tx(stage.headline)}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{tx(stage.support)}</p>
            <p className="mt-4 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-[12px] leading-5 text-muted-foreground">
              {tx({
                en: "Technology speeds up the work. People remain part of the approval process.",
                fr: "La technologie accélère le travail. Les personnes restent au cœur du processus d'approbation.",
              })}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/marketplace/post-project"
                search={{ stage: stage.key, lang, source: "managed-delivery" } as never}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {tx({ en: "Start my TAKATAK project", fr: "Démarrer mon projet TAKATAK" })}
                <ArrowRight size={14} aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => openLiveChat({ page: "managed-delivery", intent: stage.key, lang })}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <MessageSquare size={14} aria-hidden />
                {tx({ en: "Talk to TAKATAK", fr: "Parler à TAKATAK" })}
              </button>
            </div>

            {promoSaved && (
              <p className="mt-3 text-[12px] text-muted-foreground">
                {tx({ en: "Welcome offer saved", fr: "Offre de bienvenue enregistrée" })} · {PROMO_CODE}
              </p>
            )}
          </aside>
        </div>

        <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border bg-secondary/40 px-4 py-3">
          {TRUST_FOUNDATION.map((item) => (
            <li key={item.en} className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
              {tx(item)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Runs the short entry choreography for the active stage only. */
function WorkspaceStage({ index, animate }: { index: number; animate: boolean }) {
  const [beat, setBeat] = useState(MAX_BEAT);

  useEffect(() => {
    if (!animate) {
      setBeat(MAX_BEAT);
      return;
    }
    setBeat(0);
    const id = window.setInterval(() => setBeat((b) => (b >= MAX_BEAT ? b : b + 1)), BEAT_MS);
    return () => window.clearInterval(id);
  }, [animate, index]);

  return <ProjectWorkspace index={index} beat={beat} />;
}
