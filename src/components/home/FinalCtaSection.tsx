import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Headset, Pause, Play, Sparkles } from "lucide-react";
import { MotionViewport } from "@/components/motion/MotionViewport";
import { Reveal } from "@/components/motion/Reveal";
import { useLanguage } from "@/hooks/useLanguage";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { openLiveChat } from "@/lib/chatProvider";
import { getPromoState, PROMO_CODE } from "@/lib/promotions";
import { ClosingBackdrop } from "./closing/ClosingBackdrop";
import { EvolutionScene, EVOLUTION_STAGES } from "./closing/EvolutionScene";

const STAGE_MS = 1600;

export function FinalCtaSection() {
  const { tx, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [promoSaved, setPromoSaved] = useState(false);

  useEffect(() => {
    const s = getPromoState();
    setPromoSaved(s.status === "claimed" || s.status === "pending");
  }, []);

  return (
    <section
      aria-labelledby="tk-closing-title"
      className="brand-dark relative isolate overflow-hidden border-t border-border"
    >
      <ClosingBackdrop />

      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            <Sparkles size={12} aria-hidden />
            {tx({ en: "BUILD YOUR DIGITAL FUTURE", fr: "CONSTRUISEZ VOTRE FUTUR NUMÉRIQUE" })}
          </span>
          <h2
            id="tk-closing-title"
            className="mt-5 text-3xl font-bold leading-[1.12] text-foreground md:text-5xl"
          >
            {tx({
              en: "Your business deserves more than a website.",
              fr: "Votre entreprise mérite plus qu'un simple site web.",
            })}
            <span className="tk-spectrum-text block">
              {tx({
                en: "It deserves a complete digital system.",
                fr: "Elle mérite un système numérique complet.",
              })}
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            {tx({
              en: "From your first idea to your daily operations, TAKATAK builds, connects and grows your digital presence.",
              fr: "De votre première idée à vos opérations quotidiennes, TAKATAK construit, connecte et développe votre présence numérique.",
            })}
          </p>
        </Reveal>

        <div className="mt-10">
          <MotionViewport>
            {(active) => <SceneSequence animate={active && !paused && !reduced} />}
          </MotionViewport>
          {!reduced && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2.5 py-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {paused ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
              {paused
                ? tx({ en: "Play sequence", fr: "Lancer la séquence" })
                : tx({ en: "Pause sequence", fr: "Mettre en pause" })}
            </button>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/signup"
            search={{ next: "/dashboard/start", lang, source: "closing" } as never}
            className="tk-glow-cta inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            {tx({ en: "Start my TAKATAK project", fr: "Démarrer mon projet TAKATAK" })}
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {tx({ en: "Explore solutions", fr: "Explorer les solutions" })}
          </Link>
          <button
            type="button"
            onClick={() => openLiveChat({ page: "closing", lang })}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <Headset size={15} className="text-primary" aria-hidden />
            {tx({ en: "Talk to TAKATAK", fr: "Parler à TAKATAK" })}
          </button>
        </div>

        {promoSaved && (
          <p className="mt-4 text-[12.5px] text-muted-foreground">
            {tx({ en: "Welcome offer available", fr: "Offre de bienvenue disponible" })} · {PROMO_CODE}
          </p>
        )}
      </div>
    </section>
  );
}

function SceneSequence({ animate }: { animate: boolean }) {
  const last = EVOLUTION_STAGES.length - 1;
  const [active, setActive] = useState(last);

  useEffect(() => {
    if (!animate) return;
    setActive(0);
    const id = window.setInterval(() => setActive((a) => (a >= last ? 0 : a + 1)), STAGE_MS);
    return () => window.clearInterval(id);
  }, [animate, last]);

  return <EvolutionScene active={active} />;
}
