import {
  Bot,
  Compass,
  Globe,
  MapPin,
  PhoneCall,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Bilingual = { en: string; fr: string };

export interface ConciergeRecommendation {
  name: string;
  blurb: Bilingual;
  /** Internal TAKATAK route. */
  to?: string;
  /** External product site (QMAPS / FLEXS). */
  href?: string;
}

export interface ConciergePathStep {
  label: Bilingual;
  note: Bilingual;
}

export interface ConciergeGoal {
  key: string;
  /** Service intent key preserved through CTAs. */
  intent: string;
  icon: LucideIcon;
  option: Bilingual;
  answer: Bilingual;
  steps: readonly ConciergePathStep[];
  recommended: readonly ConciergeRecommendation[];
}

export const CONCIERGE_GOALS: readonly ConciergeGoal[] = [
  {
    key: "website",
    intent: "websites",
    icon: Globe,
    option: { en: "Build my website", fr: "Créer mon site web" },
    answer: {
      en: "Start with the foundation: a name you own, managed hosting and a website built to convert.",
      fr: "Commencez par la base : un nom qui vous appartient, un hébergement géré et un site conçu pour convertir.",
    },
    steps: [
      { label: { en: "Domain", fr: "Domaine" }, note: { en: "Own your business name", fr: "Possédez votre nom d'entreprise" } },
      { label: { en: "Hosting", fr: "Hébergement" }, note: { en: "Managed, secured, backed up", fr: "Géré, sécurisé, sauvegardé" } },
      { label: { en: "Website", fr: "Site web" }, note: { en: "Designed and built for you", fr: "Conçu et réalisé pour vous" } },
      { label: { en: "Growth", fr: "Croissance" }, note: { en: "Ready for visibility later", fr: "Prêt pour la visibilité ensuite" } },
    ],
    recommended: [
      { name: "TAKATAK Websites", blurb: { en: "Design and build", fr: "Conception et réalisation" }, to: "/services/websites" },
      { name: "TAKATAK Domains", blurb: { en: "Register or transfer", fr: "Enregistrer ou transférer" }, to: "/domain" },
      { name: "TAKATAK Hosting", blurb: { en: "Managed hosting plans", fr: "Forfaits d'hébergement gérés" }, to: "/hosting" },
    ],
  },
  {
    key: "customers",
    intent: "lead-generation",
    icon: Users,
    option: { en: "Get more customers", fr: "Obtenir plus de clients" },
    answer: {
      en: "Turn attention into real opportunities with local presence, campaigns and a managed lead pipeline.",
      fr: "Transformez l'attention en occasions réelles : présence locale, campagnes et pipeline de clients géré.",
    },
    steps: [
      { label: { en: "Website", fr: "Site web" }, note: { en: "A place to send people", fr: "Une destination crédible" } },
      { label: { en: "Visibility", fr: "Visibilité" }, note: { en: "Found where people search", fr: "Trouvé là où on cherche" } },
      { label: { en: "Leads", fr: "Clients potentiels" }, note: { en: "Captured and qualified", fr: "Captés et qualifiés" } },
      { label: { en: "Follow-up", fr: "Suivi" }, note: { en: "Nothing gets forgotten", fr: "Rien n'est oublié" } },
    ],
    recommended: [
      { name: "QMAPS", blurb: { en: "Local visibility product", fr: "Produit de visibilité locale" }, href: "https://qmaps.ca/" },
      { name: "FLEXS", blurb: { en: "Lead opportunities product", fr: "Produit d'occasions d'affaires" }, href: "https://flexs.ca/" },
      { name: "Lead generation", blurb: { en: "Managed lead packages", fr: "Forfaits de génération de clients" }, to: "/services/lead-generation" },
    ],
  },
  {
    key: "visibility",
    intent: "local-listings",
    icon: MapPin,
    option: { en: "Improve my visibility", fr: "Améliorer ma visibilité" },
    answer: {
      en: "Be consistent everywhere customers look: maps, listings, search and ongoing marketing.",
      fr: "Soyez cohérent partout où l'on vous cherche : cartes, fiches, recherche et marketing continu.",
    },
    steps: [
      { label: { en: "Listings", fr: "Fiches" }, note: { en: "Accurate business details", fr: "Informations exactes" } },
      { label: { en: "Maps", fr: "Cartes" }, note: { en: "Local discovery", fr: "Découverte locale" } },
      { label: { en: "Marketing", fr: "Marketing" }, note: { en: "Campaigns that reach", fr: "Des campagnes qui portent" } },
      { label: { en: "Reputation", fr: "Réputation" }, note: { en: "Reviews and consistency", fr: "Avis et cohérence" } },
    ],
    recommended: [
      { name: "Local visibility", blurb: { en: "Listings and maps service", fr: "Service de fiches et cartes" }, to: "/services/local-listings" },
      { name: "QMAPS", blurb: { en: "Local visibility product", fr: "Produit de visibilité locale" }, href: "https://qmaps.ca/" },
      { name: "Marketing", blurb: { en: "Ongoing campaigns", fr: "Campagnes continues" }, to: "/services/marketing" },
    ],
  },
  {
    key: "automation",
    intent: "automation",
    icon: Bot,
    option: { en: "Automate my business", fr: "Automatiser mon entreprise" },
    answer: {
      en: "Remove repetitive work with connected workflows and AI tools reviewed by our team.",
      fr: "Éliminez les tâches répétitives grâce à des flux connectés et des outils IA révisés par notre équipe.",
    },
    steps: [
      { label: { en: "Review", fr: "Analyse" }, note: { en: "Where time is lost", fr: "Où le temps se perd" } },
      { label: { en: "Workflows", fr: "Flux de travail" }, note: { en: "Connected steps", fr: "Étapes connectées" } },
      { label: { en: "AI tools", fr: "Outils IA" }, note: { en: "Assisted, not automatic", fr: "Assistés, pas automatiques" } },
      { label: { en: "Operations", fr: "Opérations" }, note: { en: "Running day to day", fr: "En marche au quotidien" } },
    ],
    recommended: [
      { name: "Automation", blurb: { en: "Workflow setup", fr: "Mise en place de flux" }, to: "/services/automation" },
      { name: "AI business tools", blurb: { en: "Assistants and agents", fr: "Assistants et agents" }, to: "/services/ai-business-tools" },
      { name: "Data & admin", blurb: { en: "Back-office support", fr: "Soutien administratif" }, to: "/services/data-admin" },
    ],
  },
  {
    key: "communications",
    intent: "voip",
    icon: PhoneCall,
    option: { en: "Connect my communications", fr: "Connecter mes communications" },
    answer: {
      en: "One business number, organized calls and messages connected to the rest of your systems.",
      fr: "Un numéro d'affaires, des appels et messages organisés, connectés à vos autres systèmes.",
    },
    steps: [
      { label: { en: "Business line", fr: "Ligne d'affaires" }, note: { en: "Professional number", fr: "Numéro professionnel" } },
      { label: { en: "Routing", fr: "Acheminement" }, note: { en: "Calls reach the right person", fr: "Les appels au bon endroit" } },
      { label: { en: "Follow-up", fr: "Suivi" }, note: { en: "Nothing missed", fr: "Rien de manqué" } },
      { label: { en: "Automation", fr: "Automatisation" }, note: { en: "Connected to workflows", fr: "Relié aux flux" } },
    ],
    recommended: [
      { name: "VoIP", blurb: { en: "Business phone service", fr: "Téléphonie d'affaires" }, to: "/services/voip" },
      { name: "Automation", blurb: { en: "Connect calls to workflows", fr: "Relier les appels aux flux" }, to: "/services/automation" },
      { name: "AI business tools", blurb: { en: "Assisted follow-up", fr: "Suivi assisté" }, to: "/services/ai-business-tools" },
    ],
  },
  {
    key: "guidance",
    intent: "advisory",
    icon: Compass,
    option: { en: "I need guidance", fr: "J'ai besoin d'être guidé" },
    answer: {
      en: "Tell us about the business. We review the situation and recommend the next practical step — no obligation.",
      fr: "Parlez-nous de votre entreprise. Nous analysons la situation et recommandons la prochaine étape — sans obligation.",
    },
    steps: [
      { label: { en: "Conversation", fr: "Conversation" }, note: { en: "Understand the business", fr: "Comprendre l'entreprise" } },
      { label: { en: "Priorities", fr: "Priorités" }, note: { en: "What matters first", fr: "Ce qui compte d'abord" } },
      { label: { en: "Plan", fr: "Plan" }, note: { en: "A clear recommendation", fr: "Une recommandation claire" } },
      { label: { en: "Delivery", fr: "Livraison" }, note: { en: "Managed by TAKATAK", fr: "Encadrée par TAKATAK" } },
    ],
    recommended: [
      { name: "All services", blurb: { en: "Browse the full directory", fr: "Parcourir le répertoire" }, to: "/services" },
      { name: "Marketplace", blurb: { en: "Post a project", fr: "Publier un projet" }, to: "/marketplace/post-project" },
      { name: "Websites", blurb: { en: "Most common starting point", fr: "Point de départ le plus courant" }, to: "/services/websites" },
    ],
  },
];
