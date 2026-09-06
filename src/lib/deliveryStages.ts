import { ClipboardList, FileText, FolderKanban, Wrench, Eye, ShieldCheck, Headset } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Bilingual } from "@/lib/transformationStages";

export type DeliveryStageKey =
  | "request"
  | "scope"
  | "workspace"
  | "build"
  | "review"
  | "approval"
  | "support";

export interface DeliveryStage {
  key: DeliveryStageKey;
  n: string;
  icon: LucideIcon;
  name: Bilingual;
  /** Short trust label shown under the stage name. */
  trust: Bilingual;
  /** Workspace status pill for this stage. */
  status: Bilingual;
  headline: Bilingual;
  support: Bilingual;
}

/**
 * The seven managed delivery stages. Copy only — the illustrative workspace
 * UI lives in src/components/home/journey.
 */
export const DELIVERY_STAGES: readonly DeliveryStage[] = [
  {
    key: "request",
    n: "01",
    icon: ClipboardList,
    name: { en: "Request", fr: "Demande" },
    trust: { en: "Guided intake", fr: "Prise en charge guidée" },
    status: { en: "Request received", fr: "Demande reçue" },
    headline: { en: "Start with a clear request.", fr: "Commencez par une demande claire." },
    support: {
      en: "Tell TAKATAK what you need. We organize the request before work begins.",
      fr: "Dites à TAKATAK ce dont vous avez besoin. Nous organisons la demande avant de commencer.",
    },
  },
  {
    key: "scope",
    n: "02",
    icon: FileText,
    name: { en: "Scope", fr: "Portée" },
    trust: { en: "Clear deliverables", fr: "Livrables clairs" },
    status: { en: "Awaiting confirmation", fr: "En attente de confirmation" },
    headline: {
      en: "Know what is included before production starts.",
      fr: "Sachez ce qui est inclus avant le début de la production.",
    },
    support: {
      en: "Service, package, deliverables and price are written down and confirmed with you.",
      fr: "Service, forfait, livrables et prix sont écrits puis confirmés avec vous.",
    },
  },
  {
    key: "workspace",
    n: "03",
    icon: FolderKanban,
    name: { en: "Workspace", fr: "Espace de projet" },
    trust: { en: "Organized tracking", fr: "Suivi organisé" },
    status: { en: "Project open", fr: "Projet ouvert" },
    headline: { en: "Your project stays organized in one place.", fr: "Votre projet reste organisé au même endroit." },
    support: {
      en: "Track progress, files, messages and approvals without chasing information across channels.",
      fr: "Suivez l'avancement, les fichiers, les messages et les approbations sans courir après l'information.",
    },
  },
  {
    key: "build",
    n: "04",
    icon: Wrench,
    name: { en: "Build", fr: "Réalisation" },
    trust: { en: "Managed production", fr: "Production encadrée" },
    status: { en: "Building", fr: "En production" },
    headline: { en: "Managed production, not DIY confusion.", fr: "Une production encadrée, pas du bricolage." },
    support: {
      en: "Specialists produce the work while TAKATAK keeps the schedule and quality on track.",
      fr: "Des spécialistes réalisent le travail pendant que TAKATAK garde l'échéancier et la qualité en main.",
    },
  },
  {
    key: "review",
    n: "05",
    icon: Eye,
    name: { en: "Review", fr: "Révision" },
    trust: { en: "Human review", fr: "Révision humaine" },
    status: { en: "In review", fr: "En révision" },
    headline: { en: "Review before final delivery.", fr: "Révisez avant la livraison finale." },
    support: {
      en: "See the work, leave feedback and confirm changes before approval.",
      fr: "Voyez le travail, laissez vos commentaires et confirmez les changements avant l'approbation.",
    },
  },
  {
    key: "approval",
    n: "06",
    icon: ShieldCheck,
    name: { en: "Approval", fr: "Approbation" },
    trust: { en: "Client approval", fr: "Approbation du client" },
    status: { en: "Awaiting approval", fr: "En attente d'approbation" },
    headline: {
      en: "Nothing is complete until you approve it.",
      fr: "Rien n'est terminé tant que vous n'avez pas approuvé.",
    },
    support: {
      en: "The final deliverable and its summary wait for your decision — the approval is yours to give.",
      fr: "Le livrable final et son résumé attendent votre décision — l'approbation vous appartient.",
    },
  },
  {
    key: "support",
    n: "07",
    icon: Headset,
    name: { en: "Support", fr: "Soutien" },
    trust: { en: "Bilingual assistance", fr: "Assistance bilingue" },
    status: { en: "Delivered", fr: "Livré" },
    headline: { en: "Delivery is not the end of the relationship.", fr: "La livraison n'est pas la fin de la relation." },
    support: {
      en: "Come back for support, updates and additional TAKATAK services as your business grows.",
      fr: "Revenez pour du soutien, des mises à jour et d'autres services TAKATAK au fil de votre croissance.",
    },
  },
];

export const TRUST_FOUNDATION: readonly Bilingual[] = [
  { en: "Managed delivery", fr: "Livraison encadrée" },
  { en: "Human review", fr: "Révision humaine" },
  { en: "Clear approvals", fr: "Approbations claires" },
  { en: "Private project workspace", fr: "Espace de projet privé" },
  { en: "Bilingual support", fr: "Soutien bilingue" },
];
