import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Headset, ShieldCheck, UserCheck, Languages, Lock, Sparkles, Compass } from "lucide-react";
import { AiServiceSearch } from "./AiServiceSearch";
import { BusinessSystemScene } from "./BusinessSystemScene";
import { SectionTransition } from "@/components/motion/SectionTransition";
import { PointerGlow } from "@/components/motion/PointerGlow";
import { openLiveChat } from "@/lib/chatProvider";
import { useLanguage } from "@/hooks/useLanguage";
import { pricing } from "@/lib/pricing";

const TRUST = [
  { icon: ShieldCheck, label: { en: "Managed delivery", fr: "Livraison encadrée" } },
  { icon: UserCheck, label: { en: "Human review", fr: "Révision humaine" } },
  { icon: Languages, label: { en: "Bilingual support", fr: "Soutien bilingue" } },
  { icon: Lock, label: { en: "Secure workspace", fr: "Espace de travail sécurisé" } },
] as const;

/** Signature TAKATAK hero: sales zone on the left, connected business system on the right. */
export function TakatakEcosystemHero() {
  const { tx, lang } = useLanguage();
  const [explore, setExplore] = useState(false);

  const money = (n: number) =>
    lang === "fr"
      ? `${n.toFixed(n % 1 ? 2 : 0).replace(".", ",")} $`
      : `$${n.toFixed(n % 1 ? 2 : 0)}`;

  const priceSignals = [
    { to: "/services/websites", label: { en: `Websites from ${money(pricing.websites[0].amount)}`, fr: `Sites web à partir de ${money(pricing.websites[0].amount)}` } },
    { to: "/hosting", label: { en: `Hosting from ${money(pricing.hosting[0].amount)}/month`, fr: `Hébergement à partir de ${money(pricing.hosting[0].amount)}/mois` } },
    { to: "/domain", label: { en: `Domains from ${money(pricing.domain.register.amount)}/year`, fr: `Domaines à partir de ${money(pricing.domain.register.amount)}/année` } },
  ];

  return (
    <section id="tk-hero" className="brand-dark relative overflow-hidden border-b border-border">
      <SectionTransition direction="to-dark" className="absolute inset-x-0 top-0" />

      {/* Deep graphite field with restrained emerald + cyan system light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 520px at 78% -8%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 62%), radial-gradient(820px 460px at -8% 108%, color-mix(in oklab, var(--brand-accent-cyan) 14%, transparent), transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="tk-grid-drift pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand-dark-border) 1px, transparent 1px), linear-gradient(90deg, var(--brand-dark-border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 60% 40%, black 40%, transparent 88%)",
        }}
      />

      <PointerGlow className="relative">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.02fr_1fr] lg:gap-14">
          {/* Sales zone */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/85 backdrop-blur">
              <Sparkles size={12} className="text-primary" aria-hidden />
              {tx({ en: "The digital system behind your business", fr: "Le système numérique derrière votre entreprise" })}
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-4xl lg:text-[48px]">
              {tx({ en: "Bring your business to the TAKATAK level.", fr: "Amenez votre entreprise au niveau TAKATAK." })}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              {tx({
                en: "Find the right service, launch your digital foundation, and connect websites, hosting, marketing, leads, communications and automation in one professional experience.",
                fr: "Trouvez le bon service, lancez votre fondation numérique et connectez sites web, hébergement, marketing, prospects, communications et automatisation dans une seule expérience professionnelle.",
              })}
            </p>

            <div className="mt-7">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {tx({ en: "Describe what your business needs", fr: "Décrivez ce dont votre entreprise a besoin" })}
              </p>
              <AiServiceSearch />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/marketplace/post-project"
                className="tk-glow-cta inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {tx({ en: "Start my TAKATAK setup", fr: "Démarrer ma configuration TAKATAK" })} <ArrowRight size={15} aria-hidden />
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/10"
              >
                {tx({ en: "Browse the marketplace", fr: "Explorer la place de marché" })}
              </Link>
              <button
                type="button"
                onClick={() => openLiveChat({ page: "/", intent: "hero_concierge", lang })}
                className="inline-flex items-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-foreground/85 underline-offset-4 hover:text-foreground hover:underline"
              >
                <Headset size={15} className="text-primary" aria-hidden />
                {tx({ en: "Talk to a TAKATAK specialist", fr: "Parler à un spécialiste TAKATAK" })}
              </button>
            </div>

            <ul className="mt-6 flex flex-wrap gap-2">
              {priceSignals.map((p) => (
                <li key={p.to}>
                  <Link
                    to={p.to as never}
                    className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground/85 hover:bg-white/10"
                  >
                    {tx(p.label)}
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {TRUST.map((item) => (
                <li key={item.label.en} className="inline-flex items-center gap-1.5">
                  <item.icon size={13} className="text-primary" aria-hidden /> {tx(item.label)}
                </li>
              ))}
            </ul>
          </div>

          {/* Signature visual zone */}
          <div className="relative">
            <div className="mb-3 flex items-center justify-end gap-1 rounded-full border border-white/12 bg-white/[0.04] p-1 text-[11px] font-semibold md:ml-auto md:w-fit">
              <button
                type="button"
                onClick={() => setExplore(false)}
                aria-pressed={!explore}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${!explore ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Sparkles size={12} aria-hidden /> {tx({ en: "See how TAKATAK works", fr: "Voir comment TAKATAK fonctionne" })}
              </button>
              <button
                type="button"
                onClick={() => setExplore(true)}
                aria-pressed={explore}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${explore ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Compass size={12} aria-hidden /> {tx({ en: "Explore services", fr: "Explorer les services" })}
              </button>
            </div>
            <BusinessSystemScene explore={explore} />
          </div>
        </div>
      </PointerGlow>
    </section>
  );
}
