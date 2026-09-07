import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Mic, MessageSquare } from "lucide-react";
import { MotionViewport } from "@/components/motion/MotionViewport";
import { Reveal } from "@/components/motion/Reveal";
import { useLanguage } from "@/hooks/useLanguage";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { openLiveChat } from "@/lib/chatProvider";
import { openOverlay } from "@/lib/overlayManager";
import { getPromoState, PROMO_CODE } from "@/lib/promotions";
import { CONCIERGE_GOALS } from "@/lib/conciergeGoals";
import { ConciergeBackdrop } from "./concierge/ConciergeBackdrop";
import { SolutionPathway } from "./concierge/SolutionPathway";

const BEAT_MS = 420;
const MAX_BEAT = 3;

/**
 * Pass 9 — Premium concierge sales experience. A guided selector (not a live
 * AI conversation) that maps a business goal to an illuminated pathway
 * through existing TAKATAK services.
 */
export function ConciergeSupportSection() {
  const { tx, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [promoSaved, setPromoSaved] = useState(false);

  useEffect(() => {
    const s = getPromoState();
    setPromoSaved(s.status === "claimed" || s.status === "pending");
  }, []);

  const goal = CONCIERGE_GOALS[index]!;

  return (
    <section
      aria-labelledby="tk-concierge-title"
      className="relative isolate overflow-hidden border-b border-border bg-background"
    >
      <ConciergeBackdrop />

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            {tx({ en: "TAKATAK CONCIERGE", fr: "CONCIERGERIE TAKATAK" })}
          </p>
          <h2 id="tk-concierge-title" className="mt-2 text-3xl font-bold leading-tight text-foreground md:text-4xl">
            {tx({
              en: "Not sure where to start? Tell us what your business needs.",
              fr: "Vous ne savez pas par où commencer? Expliquez-nous vos besoins.",
            })}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            {tx({
              en: "TAKATAK helps identify the right digital solutions, services and next steps.",
              fr: "TAKATAK vous aide à choisir les bonnes solutions numériques.",
            })}
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Guided conversation */}
          <div className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-sm md:p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
              TAKATAK
            </div>
            <p className="mt-3 w-fit max-w-[92%] rounded-2xl rounded-tl-sm border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground">
              {tx({ en: "What would you like to improve?", fr: "Que souhaitez-vous améliorer?" })}
            </p>

            <div
              role="radiogroup"
              aria-label={tx({ en: "Business goal", fr: "Objectif d'affaires" })}
              className="mt-4 grid gap-2 sm:grid-cols-2"
            >
              {CONCIERGE_GOALS.map((g, i) => {
                const active = i === index;
                const Icon = g.icon;
                return (
                  <button
                    key={g.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setIndex(i)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                      active
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-border bg-secondary/35 text-muted-foreground hover:border-primary/35 hover:text-foreground"
                    }`}
                  >
                    <Icon size={15} className={active ? "text-primary" : ""} aria-hidden />
                    {tx(g.option)}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 ml-auto w-fit max-w-[92%] rounded-2xl rounded-tr-sm border border-primary/30 bg-primary/[0.08] px-3.5 py-2.5 text-sm leading-6 text-foreground">
              {tx(goal.answer)}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/marketplace/post-project"
                search={{ intent: goal.intent, lang, source: "concierge" } as never}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {tx({ en: "Start my TAKATAK project", fr: "Démarrer mon projet TAKATAK" })}
                <ArrowRight size={14} aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => openLiveChat({ page: "concierge", intent: goal.intent, lang })}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <MessageSquare size={14} aria-hidden />
                {tx({ en: "Talk to TAKATAK", fr: "Parler à TAKATAK" })}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
              <span>{tx({ en: "Prefer talking?", fr: "Vous préférez parler?" })}</span>
              <button
                type="button"
                onClick={() => openOverlay("search")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5 font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Mic size={13} className="text-primary" aria-hidden />
                {tx({ en: "Use voice search", fr: "Utiliser la recherche vocale" })}
              </button>
            </div>

            {promoSaved && (
              <p className="mt-3 text-[12px] text-muted-foreground">
                {tx({ en: "Welcome offer available", fr: "Offre de bienvenue disponible" })} · {PROMO_CODE}
              </p>
            )}
          </div>

          {/* Solution visualization */}
          <MotionViewport>
            {(active) => <PathwayStage index={index} animate={active && !reduced} />}
          </MotionViewport>
        </div>
      </div>
    </section>
  );
}

/** Runs the short illumination choreography for the selected pathway. */
function PathwayStage({ index, animate }: { index: number; animate: boolean }) {
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

  return <SolutionPathway goal={CONCIERGE_GOALS[index]!} beat={beat} />;
}
