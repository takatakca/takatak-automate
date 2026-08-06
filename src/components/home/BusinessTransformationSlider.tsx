import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MotionViewport } from "@/components/motion/MotionViewport";
import { SectionTransition } from "@/components/motion/SectionTransition";
import { Reveal } from "@/components/motion/Reveal";
import { motion } from "@/lib/motionConfig";
import { useLanguage } from "@/hooks/useLanguage";
import { TRANSFORMATION_STAGES } from "@/lib/transformationStages";
import { TransformationStage } from "./TransformationStage";

const STAGES = TRANSFORMATION_STAGES;

/**
 * Launch / Grow / Operate. One cinematic stage at a time, autoplaying only
 * while visible and never while hovered, focused or in reduced motion.
 */
export function BusinessTransformationSlider() {
  const { tx } = useLanguage();

  return (
    <section
      className="brand-dark relative overflow-hidden border-y border-border"
      aria-roledescription="carousel"
      aria-label={tx({ en: "Business transformation stages", fr: "Étapes de transformation d'entreprise" })}
    >
      <SectionTransition direction="to-dark" className="absolute inset-x-0 top-0" />
      <div
        aria-hidden
        className="tk-grid-drift pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand-dark-border) 1px, transparent 1px), linear-gradient(90deg, var(--brand-dark-border) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse at 40% 30%, black 35%, transparent 85%)",
        }}
      />
      <MotionViewport className="relative">{(active) => <Slider active={active} />}</MotionViewport>
      <SectionTransition direction="to-light" className="absolute inset-x-0 bottom-0" />
    </section>
  );
}

function Slider({ active }: { active: boolean }) {
  const { tx } = useLanguage();
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const touchX = useRef<number | null>(null);
  const stage = STAGES[index]!;
  const total = stage.beats.length;
  // Beat rests at the full sequence so static / reduced-motion renders are complete.
  const [beat, setBeat] = useState(total);

  const go = useCallback((next: number) => {
    setIndex((next + STAGES.length) % STAGES.length);
  }, []);

  useEffect(() => {
    setBeat(active && !held ? 0 : STAGES[index]!.beats.length);
  }, [index, active, held]);

  useEffect(() => {
    if (!active || held) return;
    if (beat >= total) {
      const id = window.setTimeout(() => go(index + 1), motion.story.restPause + 900);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setBeat((b) => b + 1), 900);
    return () => window.clearTimeout(id);
  }, [active, held, beat, total, index, go]);

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-16 md:py-24"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        const end = e.changedTouches[0]?.clientX;
        if (start == null || end == null) return;
        if (Math.abs(end - start) > 48) go(index + (end < start ? 1 : -1));
      }}
    >
      <Reveal className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {tx({ en: "One system, three stages.", fr: "Un système, trois étapes." })}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {tx({
              en: "Launch the foundation, grow demand, then operate everything from one workspace.",
              fr: "Lancez la fondation, développez la demande, puis opérez le tout depuis un seul espace.",
            })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={tx({ en: "Previous stage", fr: "Étape précédente" })}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-white/5 text-foreground/80 hover:bg-white/10"
          >
            <ChevronLeft size={16} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={tx({ en: "Next stage", fr: "Étape suivante" })}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-white/5 text-foreground/80 hover:bg-white/10"
          >
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      </Reveal>

      {/* Stage selector */}
      <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label={tx({ en: "Stages", fr: "Étapes" })}>
        {STAGES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
              i === index
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-white/12 bg-white/[0.04] text-muted-foreground hover:text-foreground"
            }`}
          >
            {tx(s.kicker)}
          </button>
        ))}
      </div>

      <div className="mt-9">
        <TransformationStage key={stage.key} stage={stage} beat={beat} />
      </div>
    </div>
  );
}