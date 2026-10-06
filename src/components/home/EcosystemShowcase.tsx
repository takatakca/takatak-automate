import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Share2,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionTransition } from "@/components/motion/SectionTransition";
import { useLanguage } from "@/hooks/useLanguage";
import { QMAPS, FLEXS, externalLinkProps } from "@/lib/productDestinations";

type Bilingual = { en: string; fr: string };

interface EcosystemProduct {
  key: string;
  name: string;
  icon: LucideIcon;
  /** CSS colour used for the tile's glow, icon and accents. */
  accent: string;
  role: Bilingual;
  desc: Bilingual;
  points: readonly Bilingual[];
  cta: Bilingual;
  to: string;
  external?: boolean;
}

/**
 * The TAKATAK ecosystem, as defined in the knowledgeAI architecture standard:
 * one identity / control plane, with independent products that plug into it.
 */
const PRODUCTS: readonly EcosystemProduct[] = [
  {
    key: "workspace",
    name: "TAKATAK Workspace",
    icon: LayoutDashboard,
    accent: "var(--primary)",
    role: { en: "Control plane", fr: "Centre de contrôle" },
    desc: {
      en: "One login and one dashboard for every TAKATAK service you use.",
      fr: "Une seule connexion et un seul tableau de bord pour tous vos services TAKATAK.",
    },
    points: [
      { en: "Identity & OTP login", fr: "Identité et connexion OTP" },
      { en: "Billing & subscriptions", fr: "Facturation et abonnements" },
      { en: "Approvals & notifications", fr: "Approbations et alertes" },
    ],
    cta: { en: "Open your workspace", fr: "Ouvrir votre espace" },
    to: "/signup",
  },
  {
    key: "qmaps",
    name: QMAPS.name,
    icon: MapPin,
    accent: "var(--brand-accent-cyan)",
    role: { en: "Local visibility", fr: "Visibilité locale" },
    desc: {
      en: "Maps, listings and QR-powered location links so nearby customers find you.",
      fr: "Cartes, fiches et liens QR géolocalisés pour que les clients à proximité vous trouvent.",
    },
    points: [
      { en: "Business listings", fr: "Fiches d'entreprise" },
      { en: "Map & QR experiences", fr: "Cartes et codes QR" },
      { en: "Location targeting", fr: "Ciblage géographique" },
    ],
    cta: { en: "Explore QMAPS", fr: "Découvrir QMAPS" },
    to: QMAPS.productUrl,
    external: true,
  },
  {
    key: "flexs",
    name: FLEXS.name,
    icon: Target,
    accent: "var(--brand-accent-amber)",
    role: { en: "Lead capture", fr: "Capture de prospects" },
    desc: {
      en: "Turns the attention your visibility creates into tracked opportunities.",
      fr: "Transforme l'attention générée par votre visibilité en occasions suivies.",
    },
    points: [
      { en: "Inquiry capture", fr: "Capture des demandes" },
      { en: "Follow-up pipeline", fr: "Pipeline de suivi" },
      { en: "Source tracking", fr: "Suivi des sources" },
    ],
    cta: { en: "Explore FLEXS", fr: "Découvrir FLEXS" },
    to: FLEXS.productUrl,
    external: true,
  },
  {
    key: "social",
    name: "TAKATAK Social",
    icon: Share2,
    accent: "var(--brand-accent-magenta)",
    role: { en: "Social media", fr: "Médias sociaux" },
    desc: {
      en: "Plan, publish and manage your social presence from one native TAKATAK workspace.",
      fr: "Planifiez, publiez et gérez vos réseaux sociaux depuis un espace TAKATAK natif.",
    },
    points: [
      { en: "Content calendar", fr: "Calendrier de contenu" },
      { en: "Multi-brand accounts", fr: "Comptes multi-marques" },
      { en: "Managed publishing", fr: "Publication gérée" },
    ],
    cta: { en: "See social media plans", fr: "Voir les forfaits sociaux" },
    to: "/services/social-media",
  },
  {
    key: "ads",
    name: "TAKATAK Ads",
    icon: Megaphone,
    accent: "var(--brand-accent-violet)",
    role: { en: "Local ad network", fr: "Réseau publicitaire local" },
    desc: {
      en: "Sponsor and ad placements across TAKATAK network sites, sold per site or as cross-site packages.",
      fr: "Placements commanditaires et publicitaires sur les sites du réseau TAKATAK, par site ou en forfait multisite.",
    },
    points: [
      { en: "Sponsor showcases & pop-ups", fr: "Vitrines commanditaires et fenêtres" },
      { en: "AdSense-compatible slots", fr: "Emplacements compatibles AdSense" },
      { en: "Cross-site campaigns", fr: "Campagnes multisites" },
    ],
    cta: { en: "Advertise with TAKATAK", fr: "Annoncer avec TAKATAK" },
    to: "/services/marketing",
  },
  {
    key: "automation",
    name: "TAKATAK AI",
    icon: Bot,
    accent: "var(--brand-accent-blue)",
    role: { en: "AI workforce", fr: "Main-d'œuvre IA" },
    desc: {
      en: "AI intake, automated workflows and notifications that run the repetitive work for you.",
      fr: "Accueil IA, flux automatisés et alertes qui prennent en charge le travail répétitif.",
    },
    points: [
      { en: "AI project briefs", fr: "Briefs de projet IA" },
      { en: "Workflow automation", fr: "Automatisation des flux" },
      { en: "Human review built in", fr: "Révision humaine intégrée" },
    ],
    cta: { en: "Automate my business", fr: "Automatiser mon entreprise" },
    to: "/services/automation",
  },
];

/** Live sites in the TAKATAK network that already carry ecosystem features. */
const NETWORK_SITES = [
  {
    name: "AHM Verdun",
    url: "https://ahmverdun.ca",
    note: {
      en: "Hockey association site: sponsor showcases, house ads and AdSense placements.",
      fr: "Site de hockey : vitrines commanditaires, annonces maison et placements AdSense.",
    },
  },
] as const;

export function EcosystemShowcase() {
  const { tx } = useLanguage();

  return (
    <section
      id="ecosystem"
      className="brand-dark relative overflow-hidden"
      aria-labelledby="tk-ecosystem-title"
    >
      <SectionTransition direction="to-dark" className="absolute inset-x-0 top-0" />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="tk-aurora tk-aurora-a left-[-10%] top-[-10%] h-[420px] w-[520px] bg-[var(--brand-accent-cyan)] opacity-30" />
        <div className="tk-aurora tk-aurora-b right-[-8%] top-[30%] h-[480px] w-[560px] bg-[var(--brand-accent-magenta)] opacity-25" />
        <div className="tk-aurora tk-aurora-a bottom-[-20%] left-[30%] h-[400px] w-[600px] bg-[var(--brand-accent-violet)] opacity-30" />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 py-20 md:py-28">
        <Reveal className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent-cyan)]">
            {tx({ en: "The TAKATAK ecosystem", fr: "L'écosystème TAKATAK" })}
          </p>
          <h2
            id="tk-ecosystem-title"
            className="mt-3 text-[32px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground md:text-[48px]"
          >
            {tx({ en: "One identity. ", fr: "Une identité. " })}
            <span className="tk-spectrum-text">
              {tx({
                en: "Every tool your business runs on.",
                fr: "Tous les outils de votre entreprise.",
              })}
            </span>
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted-foreground md:text-base">
            {tx({
              en: "TAKATAK is the control plane. Your login, billing and workspace live in one place, and each product plugs into it — so visibility, leads, social, advertising and automation all work together instead of in separate tools.",
              fr: "TAKATAK est le centre de contrôle. Votre connexion, votre facturation et votre espace sont au même endroit, et chaque produit s'y branche — visibilité, prospects, réseaux sociaux, publicité et automatisation travaillent ensemble.",
            })}
          </p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <Reveal as="li" key={p.key} delay={i * 70}>
              <article
                className="tk-eco-tile flex h-full flex-col rounded-2xl p-6"
                style={{ ["--tk-accent" as string]: p.accent }}
              >
                <div className="flex items-center gap-3">
                  <span className="tk-eco-icon inline-flex h-11 w-11 items-center justify-center rounded-xl">
                    <p.icon size={20} aria-hidden />
                  </span>
                  <div>
                    <p className="tk-eco-accent text-[10.5px] font-semibold uppercase tracking-[0.18em]">
                      {tx(p.role)}
                    </p>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">{p.name}</h3>
                  </div>
                </div>
                <p className="mt-4 text-[14px] leading-6 text-muted-foreground">{tx(p.desc)}</p>
                <ul className="mt-4 space-y-1.5">
                  {p.points.map((pt) => (
                    <li
                      key={pt.en}
                      className="flex items-center gap-2 text-[13px] text-foreground/85"
                    >
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: p.accent }}
                      />
                      {tx(pt)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  {p.external ? (
                    <a
                      href={p.to}
                      {...externalLinkProps}
                      className="tk-eco-accent inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                    >
                      {tx(p.cta)} <ArrowUpRight size={14} aria-hidden />
                    </a>
                  ) : (
                    <Link
                      to={p.to as never}
                      className="tk-eco-accent inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                    >
                      {tx(p.cta)} <ArrowRight size={14} aria-hidden />
                    </Link>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-10">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {tx({ en: "Live on the TAKATAK network", fr: "En ligne sur le réseau TAKATAK" })}
              </p>
              <ul className="mt-2 space-y-1">
                {NETWORK_SITES.map((site) => (
                  <li key={site.url} className="text-sm text-foreground/90">
                    <a
                      href={site.url}
                      {...externalLinkProps}
                      className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
                    >
                      {site.name} <ArrowUpRight size={13} aria-hidden />
                    </a>
                    <span className="text-muted-foreground"> — {tx(site.note)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to="/marketplace/post-project"
              className="tk-glow-cta inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {tx({ en: "Build my TAKATAK system", fr: "Bâtir mon système TAKATAK" })}{" "}
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
      <SectionTransition direction="to-light" className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
