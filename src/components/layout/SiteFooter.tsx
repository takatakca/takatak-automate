import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Linkedin, Facebook, Instagram, Youtube, ShieldCheck, Lock, BadgeCheck, LifeBuoy } from "lucide-react";
import { brand } from "@/lib/brand";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { QMAPS, FLEXS, externalLinkProps } from "@/lib/productDestinations";
import type { Bilingual } from "@/lib/businessPaths";

interface FooterLink {
  label: Bilingual;
  to?: string;
  href?: string;
}

interface FooterColumn {
  title: Bilingual;
  links: readonly FooterLink[];
}

const COLUMNS: readonly FooterColumn[] = [
  {
    title: { en: "Discover", fr: "Découvrir" },
    links: [
      { label: { en: "Marketplace", fr: "Marché" }, to: "/marketplace" },
      { label: { en: "Trending projects", fr: "Projets tendance" }, to: "/marketplace/search" },
      { label: { en: "Services", fr: "Services" }, to: "/services" },
      { label: { en: "Pricing", fr: "Tarifs" }, to: "/pricing" },
      { label: { en: "Deals", fr: "Promotions" }, to: "/deals" },
    ],
  },
  {
    title: { en: "Build", fr: "Construire" },
    links: [
      { label: { en: "Domains", fr: "Domaines" }, to: "/domain" },
      { label: { en: "Hosting", fr: "Hébergement" }, to: "/hosting" },
      { label: { en: "Websites", fr: "Sites web" }, to: "/services/websites" },
      { label: { en: "Mobile apps", fr: "Applications mobiles" }, to: "/services/mobile-apps" },
      { label: { en: "Branding", fr: "Image de marque" }, to: "/services/logo-branding" },
    ],
  },
  {
    title: { en: "Grow", fr: "Croître" },
    links: [
      { label: { en: "Marketing", fr: "Marketing" }, to: "/services/marketing" },
      { label: { en: "QMAPS", fr: "QMAPS" }, href: QMAPS.productUrl },
      { label: { en: "FLEXS", fr: "FLEXS" }, href: FLEXS.productUrl },
      { label: { en: "Lead generation", fr: "Génération de prospects" }, to: "/services/lead-generation" },
      { label: { en: "Social media", fr: "Médias sociaux" }, to: "/services/social-media" },
    ],
  },
  {
    title: { en: "Operate", fr: "Opérer" },
    links: [
      { label: { en: "Automation", fr: "Automatisation" }, to: "/services/automation" },
      { label: { en: "AI tools", fr: "Outils IA" }, to: "/services/ai-business-tools" },
      { label: { en: "VoIP", fr: "Téléphonie VoIP" }, to: "/services/voip" },
      { label: { en: "Dashboard", fr: "Tableau de bord" }, to: "/dashboard" },
      { label: { en: "Support", fr: "Assistance" }, to: "/dashboard/support" },
    ],
  },
  {
    title: { en: "Company", fr: "Entreprise" },
    links: [
      { label: { en: "About TAKATAK", fr: "À propos de TAKATAK" }, to: "/" },
      { label: { en: "Contact", fr: "Nous joindre" }, to: "/dashboard/support" },
      { label: { en: "Privacy", fr: "Confidentialité" }, to: "/privacy-manager" },
      { label: { en: "Sign in", fr: "Connexion" }, to: "/login" },
      { label: { en: "Get started", fr: "Commencer" }, to: "/signup" },
    ],
  },
] as const;

const TRUST = [
  { icon: ShieldCheck, label: { en: "Secure payments", fr: "Paiements sécurisés" } },
  { icon: Lock, label: { en: "Protected accounts", fr: "Comptes protégés" } },
  { icon: BadgeCheck, label: { en: "Professional delivery", fr: "Livraison professionnelle" } },
  { icon: LifeBuoy, label: { en: "Dedicated support", fr: "Soutien dédié" } },
] as const;

const SOCIALS = [
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/" },
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/" },
] as const;

/** `flush` drops the top gap when the page already ends on a dark band. */
export function SiteFooter({ flush = false }: { flush?: boolean } = {}) {
  const { tx } = useLanguage();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <footer className={`brand-dark relative ${flush ? "" : "mt-24"} overflow-hidden border-t border-border`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(700px 260px at 12% -30%, color-mix(in oklab, var(--brand-accent-cyan) 12%, transparent), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--brand-accent-cyan), var(--brand-accent-violet), transparent)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_2.4fr]">
          {/* Brand */}
          <div>
            <h3 className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-foreground drop-shadow-[0_0_18px_color-mix(in_oklab,var(--brand-accent-cyan)_35%,transparent)]">
                {brand.brandName}
              </span>
              <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            </h3>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {tx({
                en: "Your complete digital business ecosystem.",
                fr: "Votre écosystème d'affaires numérique complet.",
              })}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">{brand.supportEmail}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <LanguageSwitcher />
              <div className="flex items-center gap-1.5">
                {SOCIALS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      {...externalLinkProps}
                      aria-label={s.label}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      <Icon size={14} aria-hidden />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Columns — accordion on mobile, grid from md */}
          <div className="grid grid-cols-1 gap-1 md:grid-cols-3 md:gap-8 lg:grid-cols-5">
            {COLUMNS.map((col) => {
              const title = tx(col.title);
              const expanded = open === title;
              return (
                <div key={title} className="border-b border-border/70 md:border-0">
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : title)}
                    aria-expanded={expanded}
                    className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-foreground md:pointer-events-none md:py-0 md:mb-4"
                  >
                    {title}
                    <ChevronDown
                      size={15}
                      aria-hidden
                      className={`text-muted-foreground transition-transform duration-300 md:hidden ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  <ul
                    className={`space-y-2 pb-3 text-sm text-muted-foreground md:block md:pb-0 ${expanded ? "block" : "hidden"}`}
                  >
                    {col.links.map((l) => (
                      <li key={tx(l.label)}>
                        {l.href ? (
                          <a
                            href={l.href}
                            {...externalLinkProps}
                            className="transition-colors hover:text-foreground"
                          >
                            {tx(l.label)}
                          </a>
                        ) : (
                          <Link to={l.to!} className="transition-colors hover:text-foreground">
                            {tx(l.label)}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust row */}
        <ul className="mt-12 grid grid-cols-2 gap-3 border-t border-border pt-8 md:grid-cols-4">
          {TRUST.map((t) => {
            const Icon = t.icon;
            return (
              <li key={t.label.en} className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                <Icon size={14} className="text-primary" aria-hidden />
                {tx(t.label)}
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.legalName}. {brand.domain}
          </p>
          <p>{tx({ en: brand.positioning, fr: "Services en ligne gérés pour entreprises en croissance." })}</p>
        </div>
      </div>
    </footer>
  );
}
