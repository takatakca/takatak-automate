import { useEffect, useState } from "react";
import { ECOSYSTEM_NODES } from "./ecosystemNodes";
import { EcosystemNode } from "./EcosystemNode";
import { EcosystemConnection } from "./EcosystemConnection";
import { MotionViewport } from "@/components/motion/MotionViewport";
import { motion } from "@/lib/motionConfig";
import { useLanguage } from "@/hooks/useLanguage";

const TOTAL = ECOSYSTEM_NODES.length;

/**
 * The signature TAKATAK scene: one connected business journey from domain to
 * managed workspace. The animation is an explanation of the workflow — never
 * live customer or provider data.
 */
export function BusinessSystemScene({ explore = false }: { explore?: boolean }) {
  const { tx } = useLanguage();
  return (
    <MotionViewport className="relative w-full">
      {(active) => <Scene active={active && !explore} />}
    </MotionViewport>
  );

  function Scene({ active }: { active: boolean }) {
    // `step` = how many nodes have activated. Starts fully connected so
    // reduced-motion and static renders still show the complete system.
    const [step, setStep] = useState(TOTAL);
    const [selected, setSelected] = useState<string | null>(null);
    const paused = selected !== null;

    useEffect(() => {
      if (!active) {
        setStep(TOTAL);
        return;
      }
      if (paused) return;
      const id = window.setInterval(() => {
        setStep((s) => (s >= TOTAL ? 0 : s + 1));
      }, step >= TOTAL ? motion.story.step + motion.story.restPause : motion.story.step);
      return () => window.clearInterval(id);
    }, [active, paused, step]);

    return (
      <div className="relative">
        <p className="sr-only">
          {tx({
            en: "Illustration of the TAKATAK workflow: domain, hosting, website, marketing, customer inquiries, business phone, automation and your managed workspace, connected in one system.",
            fr: "Illustration du parcours TAKATAK : domaine, hébergement, site web, marketing, demandes clients, téléphonie, automatisation et votre espace géré, connectés en un seul système.",
          })}
        </p>

        {/* Desktop / tablet: positioned connected scene */}
        <div className="relative hidden aspect-[720/520] w-full md:block" aria-hidden={false}>
          <EcosystemConnection nodes={ECOSYSTEM_NODES} step={step} animated={active} />
          {ECOSYSTEM_NODES.map((n, i) => (
            <div key={n.key} style={{ left: `${(n.x / 720) * 100}%`, top: `${(n.y / 520) * 100}%`, position: "absolute" }}>
              <EcosystemNode
                node={n}
                reached={step > i}
                current={step === i + 1}
                selected={selected === n.key}
                onEnter={() => setSelected(n.key)}
                onLeave={() => setSelected(null)}
              />
            </div>
          ))}
        </div>

        {/* Mobile: simplified vertical flow, tap to explain */}
        <ul className="relative space-y-2.5 md:hidden">
          <span aria-hidden className="absolute left-[26px] top-3 bottom-3 w-px bg-white/12" />
          {ECOSYSTEM_NODES.map((n, i) => (
            <li key={n.key} className="relative">
              <EcosystemNode
                node={n}
                positioned={false}
                reached={step > i}
                current={step === i + 1}
                selected={selected === n.key}
                onEnter={() => setSelected(n.key)}
                onLeave={() => setSelected(null)}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
