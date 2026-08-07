import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { UniversalSearchPanel } from "@/components/search/UniversalSearchPanel";
import { HeaderDomainSearch } from "@/components/domain/HeaderDomainSearch";
import { HeaderProductLink } from "@/components/layout/HeaderProductAction";
import { ProductLauncher } from "@/components/layout/ProductLauncher";
import { MarketplaceCategoryRail } from "@/components/marketplace/MarketplaceCategoryRail";
import { MARKETPLACE_GROUPS } from "@/lib/marketplaceGroups";
import {
  TrendingUp, Code2, Megaphone, Video, Server, Globe2,
  Smartphone, PhoneCall, Workflow, Bot, MapPin, Database, Target,
} from "lucide-react";

const primaryNav = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/pricing", label: "Pricing" },
  { to: "/deals", label: "Deals" },
] as const;

/** Services mega-menu — grouped so the top bar stays clean. */
const MEGA_MENU = [
  {
    heading: "Launch",
    items: [
      { to: "/services/websites", label: "Websites", icon: Code2 },
      { to: "/domain", label: "Domains", icon: Globe2 },
      { to: "/hosting", label: "Hosting", icon: Server },
      { to: "/services/mobile-apps", label: "Mobile Apps", icon: Smartphone },
    ],
  },
  {
    heading: "Grow",
    items: [
      { to: "/services/marketing", label: "Marketing", icon: Megaphone },
      { to: "/services/social-media", label: "Social Media", icon: Video },
      { to: "/services/local-listings", label: "Local Visibility", icon: MapPin },
      { to: "/services/lead-generation", label: "Lead Generation", icon: TrendingUp },
    ],
  },
  {
    heading: "Operate",
    items: [
      { to: "/services/voip", label: "VoIP", icon: PhoneCall },
      { to: "/services/ai-business-tools", label: "AI Tools", icon: Bot },
      { to: "/services/automation", label: "Automation", icon: Workflow },
      { to: "/services/data-admin", label: "Data & Admin", icon: Database },
    ],
  },
] as const;

const allNav = [
  ...primaryNav,
  ...MEGA_MENU.flatMap((g) => g.items.map((i) => ({ to: i.to, label: i.label }))),
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { t, tx } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <nav className="max-w-7xl mx-auto flex items-center px-4 h-16 gap-5">
        <Link to="/" className="flex items-center gap-1.5 shrink-0" aria-label="TAKATAK home">
          <span className="text-[22px] font-extrabold tracking-tight text-foreground">TAKATAK</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-3" aria-hidden />
        </Link>
        <div className="hidden md:flex flex-1 min-w-0 items-center gap-1.5">
          <div className="min-w-[170px] flex-1 max-w-md">
            <UniversalSearchPanel />
          </div>
          <HeaderDomainSearch />
          <span className="hidden xl:contents">
            <HeaderProductLink
              to="/services/local-listings"
              label="QMAPS"
              tooltip={t("nav.qmapsDesc")}
              icon={MapPin}
              introClass="animate-scale-in"
            />
            <HeaderProductLink
              to="/services/lead-generation"
              label="FLEXS"
              tooltip={t("nav.flexsDesc")}
              icon={Target}
              introClass="animate-fade-in"
            />
          </span>
          <span className="contents xl:hidden">
            <HeaderProductLink
              to="/services/local-listings"
              label="QMAPS"
              tooltip={t("nav.qmapsDesc")}
              icon={MapPin}
              compact
            />
            <HeaderProductLink
              to="/services/lead-generation"
              label="FLEXS"
              tooltip={t("nav.flexsDesc")}
              icon={Target}
              compact
            />
          </span>
        </div>
        <ul className="hidden lg:flex items-center gap-0 shrink-0 text-[13px] font-medium ml-auto">
          {primaryNav.map((n) => (
            <li key={n.to}>
              <Link
                to={n.to}
                className="px-2.5 py-2 rounded-md text-foreground/75 hover:text-foreground transition-colors whitespace-nowrap"
                activeProps={{ className: "px-2.5 py-2 rounded-md text-foreground whitespace-nowrap" }}
              >
                {n.label}
              </Link>
            </li>
          ))}
          <li
            className="relative"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              type="button"
              className="px-2.5 py-2 rounded-md text-foreground/75 hover:text-foreground transition-colors inline-flex items-center gap-1 whitespace-nowrap"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
            >
              {t("nav.services")} <ChevronDown size={13} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full pt-2">
                <div className="grid w-[620px] grid-cols-3 gap-5 rounded-xl border border-border bg-popover p-5 shadow-xl">
                  {MEGA_MENU.map((group) => (
                    <div key={group.heading}>
                      <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.heading}
                      </p>
                      <div className="mt-2 space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setMoreOpen(false)}
                              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground"
                            >
                              <Icon size={14} className="text-primary" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </li>
        </ul>
        <div className="hidden lg:flex items-center gap-1 ml-2 shrink-0">
          <LanguageSwitcher className="mr-1" />
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="px-3 py-2 text-[13px] font-medium rounded-md hover:bg-secondary whitespace-nowrap"
              >
                {t("nav.dashboard")}
              </Link>
              <button
                onClick={() => void logout()}
                className="px-3 py-2 text-[13px] font-medium rounded-md border border-border hover:bg-secondary whitespace-nowrap"
              >
                {t("nav.signout")}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-2 text-[13px] font-medium text-foreground/80 hover:text-foreground rounded-md whitespace-nowrap"
              >
                {t("nav.signin")}
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-2 text-[13px] font-semibold rounded-md text-primary-foreground bg-primary hover:opacity-90 whitespace-nowrap"
              >
                {t("nav.getStarted")}
              </Link>
            </>
          )}
        </div>
        <div className="lg:hidden ml-auto flex items-center gap-1">
          <div className="md:hidden">
            <ProductLauncher />
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md hover:bg-secondary"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      <MarketplaceCategoryRail />
      {open && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          <div className="pb-3 mb-2 border-b border-border space-y-2">
            <UniversalSearchPanel compact />
            <HeaderDomainSearch />
          </div>
          {allNav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md text-sm hover:bg-secondary"
            >
              {n.label}
            </Link>
          ))}
          <div className="pt-2 mt-1 border-t border-border">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("nav.marketplace")}
            </p>
            {MARKETPLACE_GROUPS.map((g) => (
              <Link
                key={g.slug}
                to="/marketplace/search"
                search={{ q: "", category: "", sort: "recommended", group: g.slug }}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-md text-sm hover:bg-secondary"
              >
                {tx(g.label)}
              </Link>
            ))}
          </div>
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
          <div className="pt-2 mt-2 border-t border-border flex gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="flex-1 text-center px-3 py-2 rounded-md border border-border text-sm">
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                  className="flex-1 px-3 py-2 rounded-md border border-border text-sm"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-3 py-2 rounded-md border border-border text-sm">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center px-3 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary"
                >
                  Start
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}