// Public site navigation model. Bilingual labels, outcome lines and
// starting prices come from centralized data — never hardcoded per page.
import { pricing, formatCAD, type Cadence } from "@/lib/pricing";

export interface Bi {
  en: string;
  fr: string;
}

export interface NavItem {
  to: string;
  label: Bi;
  outcome: Bi;
  from?: { amount: number; cadence: Cadence };
}

export interface NavGroup {
  key: "build" | "grow" | "operate";
  label: Bi;
  items: readonly NavItem[];
}

const bi = (en: string, fr: string): Bi => ({ en, fr });

export const serviceGroups: readonly NavGroup[] = [
  {
    key: "build",
    label: bi("Build", "Créer"),
    items: [
      {
        to: "/services/websites",
        label: bi("Websites", "Sites web"),
        outcome: bi("Turn your website into a sales asset.", "Transformez votre site en outil de vente."),
        from: { amount: pricing.websites[0].amount, cadence: "one-time" },
      },
      {
        to: "/services/websites",
        label: bi("Ecommerce", "Commerce en ligne"),
        outcome: bi("Sell products and take payments online.", "Vendez vos produits et encaissez en ligne."),
        from: { amount: pricing.websites[3].amount, cadence: "one-time" },
      },
      {
        to: "/services/mobile-apps",
        label: bi("Mobile apps", "Applications mobiles"),
        outcome: bi("Put your service in your customers' hands.", "Mettez votre service dans les mains des clients."),
        from: { amount: pricing.apps[0].amount, cadence: "one-time" },
      },
      {
        to: "/services/logo-branding",
        label: bi("Logo & branding", "Logo et image de marque"),
        outcome: bi("Look established from the first impression.", "Projetez une image établie dès le départ."),
        from: { amount: pricing.branding[0].amount, cadence: "one-time" },
      },
      {
        to: "/services/menu-flyer-design",
        label: bi("Menu & flyer design", "Menus et dépliants"),
        outcome: bi("Print and digital pieces that sell.", "Imprimés et visuels qui font vendre."),
        from: { amount: pricing.design[0].amount, cadence: "one-time" },
      },
    ],
  },
  {
    key: "grow",
    label: bi("Grow", "Croître"),
    items: [
      {
        to: "/services/marketing",
        label: bi("Marketing", "Marketing"),
        outcome: bi("Campaigns measured by real business results.", "Des campagnes mesurées par de vrais résultats."),
        from: { amount: pricing.marketing[0].amount, cadence: "one-time" },
      },
      {
        to: "/services/social-media",
        label: bi("Social media", "Médias sociaux"),
        outcome: bi("Stay visible without doing it yourself.", "Restez visible sans tout faire vous-même."),
        from: { amount: pricing.social[0].amount, cadence: "monthly" },
      },
      {
        to: "/services/local-listings",
        label: bi("Local visibility", "Visibilité locale"),
        outcome: bi("Be found by nearby customers.", "Soyez trouvé par les clients près de vous."),
        from: { amount: pricing.local[0].amount, cadence: "one-time" },
      },
      {
        to: "/services/lead-generation",
        label: bi("Lead generation", "Génération de clients"),
        outcome: bi("Qualified inquiries, not raw traffic.", "Des demandes qualifiées, pas juste du trafic."),
        from: { amount: pricing.leads[0].amount, cadence: "one-time" },
      },
    ],
  },
  {
    key: "operate",
    label: bi("Operate", "Opérer"),
    items: [
      {
        to: "/domain",
        label: bi("Domains", "Noms de domaine"),
        outcome: bi("Own the name customers type.", "Possédez le nom que vos clients tapent."),
        from: { amount: pricing.domain.register.amount, cadence: "yearly" },
      },
      {
        to: "/hosting",
        label: bi("Hosting", "Hébergement"),
        outcome: bi("A stable foundation, ready when customers arrive.", "Une base stable, prête quand les clients arrivent."),
        from: { amount: pricing.hosting[0].amount, cadence: "monthly" },
      },
      {
        to: "/services/voip",
        label: bi("VoIP", "Téléphonie VoIP"),
        outcome: bi("Give every call a professional experience.", "Offrez une expérience professionnelle à chaque appel."),
        from: { amount: pricing.voip[0].amount, cadence: "monthly" },
      },
      {
        to: "/services/automation",
        label: bi("Automation", "Automatisation"),
        outcome: bi("Remove repetitive work from your operations.", "Retirez les tâches répétitives de vos opérations."),
        from: { amount: pricing.ai[0].amount, cadence: "one-time" },
      },
      {
        to: "/services/ai-business-tools",
        label: bi("AI business tools", "Outils d'affaires IA"),
        outcome: bi("Guided assistants your team stays in control of.", "Des assistants guidés que votre équipe contrôle."),
        from: { amount: pricing.ai[1].amount, cadence: "one-time" },
      },
      {
        to: "/services/data-admin",
        label: bi("Data & administration", "Données et administration"),
        outcome: bi("Turn messy records into usable information.", "Transformez vos données en information utile."),
        from: { amount: pricing.admin[0].amount, cadence: "one-time" },
      },
    ],
  },
];

export const cadenceShort: Record<Cadence, Bi> = {
  monthly: bi("/mo", "/mois"),
  yearly: bi("/yr", "/an"),
  "per-lead": bi("/lead", "/client"),
  "one-time": bi("", ""),
  custom: bi("", ""),
};

export function fromLabel(lang: "en" | "fr", amount: number, cadence: Cadence): string {
  return `${formatCAD(amount)}${cadenceShort[cadence][lang]}`;
}