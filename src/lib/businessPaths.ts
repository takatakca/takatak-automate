import { formatCAD, pricing } from "@/lib/pricing";

/**
 * Pass 7 — TAKATAK business paths (Launch / Grow / Operate).
 *
 * These are conceptual groupings of real services, not bundles: every price
 * shown is an individual starting price read from the centralized pricing
 * registry. No bundled price is invented here.
 */

export type Bilingual<T = string> = { en: T; fr: T };
export type PathKey = "launch" | "grow" | "operate";

export interface StartingPoint {
  label: Bilingual;
  amount: number;
  /** Bilingual cadence suffix appended after the amount. */
  cadence: Bilingual;
  to: string;
}

export interface PathAction {
  label: Bilingual;
  to: string;
  external?: boolean;
}

export interface BusinessPath {
  key: PathKey;
  /** Service key preserved through signup / intent handoff. */
  serviceKey: string;
  word: Bilingual;
  name: Bilingual;
  eyebrow: Bilingual;
  headline: Bilingual;
  support: Bilingual;
  starting: readonly StartingPoint[];
  /** Number of choreography beats in the world story. */
  beats: number;
  status: Bilingual;
  primary: PathAction;
  secondary: PathAction;
  /** Continuity caption for the shared TAKATAK workspace object. */
  workspace: Bilingual;
}

const YEAR: Bilingual = { en: "/year", fr: "/an" };
const MONTH: Bilingual = { en: "/month", fr: "/mois" };
const ONCE: Bilingual = { en: "", fr: "" };
const LEAD: Bilingual = { en: "/lead", fr: "/prospect" };

export const BUSINESS_PATHS: readonly BusinessPath[] = [
  {
    key: "launch",
    serviceKey: "websites",
    word: { en: "LAUNCH", fr: "LANCER" },
    name: { en: "Launch", fr: "Lancer" },
    eyebrow: { en: "Digital foundation", fr: "Fondation numérique" },
    headline: {
      en: "Build the professional presence customers expect.",
      fr: "Bâtissez la présence professionnelle que vos clients attendent.",
    },
    support: {
      en: "Start with the essentials your business needs to look established and operate online.",
      fr: "Commencez avec l'essentiel pour paraître établi et opérer en ligne.",
    },
    starting: [
      { label: { en: "Domain", fr: "Domaine" }, amount: pricing.domain.register.amount, cadence: YEAR, to: "/domain" },
      { label: { en: "Hosting", fr: "Hébergement" }, amount: pricing.hosting[0].amount, cadence: MONTH, to: "/hosting" },
      { label: { en: "Website", fr: "Site web" }, amount: pricing.websites[0].amount, cadence: ONCE, to: "/services/websites" },
      { label: { en: "Branding", fr: "Image de marque" }, amount: pricing.branding[0].amount, cadence: ONCE, to: "/services/logo-branding" },
    ],
    beats: 6,
    status: { en: "Ready to launch", fr: "Prêt à lancer" },
    primary: { label: { en: "Launch my business", fr: "Lancer mon entreprise" }, to: "/services/websites" },
    secondary: { label: { en: "View launch services", fr: "Voir les services de lancement" }, to: "/services" },
    workspace: { en: "Setup progress", fr: "Progression de la configuration" },
  },
  {
    key: "grow",
    serviceKey: "lead-generation",
    word: { en: "GROW", fr: "CROÎTRE" },
    name: { en: "Grow", fr: "Croître" },
    eyebrow: { en: "Customer growth", fr: "Croissance client" },
    headline: {
      en: "Get found. Turn attention into opportunity.",
      fr: "Soyez trouvé. Transformez l'attention en occasions.",
    },
    support: {
      en: "Connect marketing, local visibility and lead generation around the customer journey.",
      fr: "Reliez marketing, visibilité locale et génération de prospects autour du parcours client.",
    },
    starting: [
      { label: { en: "Marketing", fr: "Marketing" }, amount: pricing.marketing[0].amount, cadence: ONCE, to: "/services/marketing" },
      { label: { en: "Local visibility", fr: "Visibilité locale" }, amount: pricing.local[0].amount, cadence: ONCE, to: "/services/local-listings" },
      { label: { en: "Qualified leads", fr: "Prospects qualifiés" }, amount: pricing.leads[1].amount, cadence: LEAD, to: "/services/lead-generation" },
      { label: { en: "Social", fr: "Réseaux sociaux" }, amount: pricing.social[0].amount, cadence: MONTH, to: "/services/social-media" },
    ],
    beats: 8,
    status: { en: "Growth system active", fr: "Système de croissance actif" },
    primary: { label: { en: "Build my growth system", fr: "Créer mon système de croissance" }, to: "/services/lead-generation" },
    secondary: { label: { en: "Explore growth services", fr: "Explorer les services de croissance" }, to: "/services" },
    workspace: { en: "Customer activity", fr: "Activité client" },
  },
  {
    key: "operate",
    serviceKey: "ai-business-tools",
    word: { en: "OPERATE", fr: "OPÉRER" },
    name: { en: "Operate", fr: "Opérer" },
    eyebrow: { en: "Connected operations", fr: "Opérations connectées" },
    headline: {
      en: "Connect the systems behind your business.",
      fr: "Connectez les systèmes derrière votre entreprise.",
    },
    support: {
      en: "Bring communications, automation and intelligent business tools into one connected operating experience.",
      fr: "Réunissez communications, automatisation et outils d'affaires intelligents dans une seule expérience connectée.",
    },
    starting: [
      { label: { en: "Business VoIP", fr: "Téléphonie d'affaires" }, amount: pricing.voip[0].amount, cadence: MONTH, to: "/services/voip" },
      { label: { en: "Automation", fr: "Automatisation" }, amount: pricing.ai[0].amount, cadence: ONCE, to: "/services/automation" },
      { label: { en: "AI tools", fr: "Outils IA" }, amount: pricing.ai[1].amount, cadence: ONCE, to: "/services/ai-business-tools" },
      { label: { en: "Admin support", fr: "Soutien administratif" }, amount: pricing.admin[0].amount, cadence: ONCE, to: "/services/data-admin" },
    ],
    beats: 8,
    status: { en: "Operations connected", fr: "Opérations connectées" },
    primary: { label: { en: "Connect my business systems", fr: "Connecter mes systèmes d'entreprise" }, to: "/services/automation" },
    secondary: { label: { en: "Explore operations", fr: "Explorer les opérations" }, to: "/services" },
    workspace: { en: "Operations control", fr: "Contrôle des opérations" },
  },
] as const;

export function pathPrice(point: StartingPoint, lang: "en" | "fr"): string {
  const from = lang === "fr" ? "à partir de " : "from ";
  return `${from}${formatCAD(point.amount)}${point.cadence[lang]}`;
}

export function findPath(key: PathKey): BusinessPath {
  return BUSINESS_PATHS.find((p) => p.key === key)!;
}
