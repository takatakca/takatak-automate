import { Link } from "@tanstack/react-router";
import {
  Globe2, Palette, Smartphone, Server, Megaphone, Share2, MapPin,
  Target, PhoneCall, Workflow, ClipboardList, Utensils, Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Cat { icon: LucideIcon; title: string; label: string; to: string }

const CATEGORIES: readonly Cat[] = [
  { icon: Rocket,        title: "Websites",         label: "Business sites, landing pages, ecommerce", to: "/services/websites" },
  { icon: Palette,       title: "Logo & Branding",  label: "Logos, brand kits, visual identity",       to: "/marketplace/category/logo_design" },
  { icon: Smartphone,    title: "Mobile Apps",      label: "Prototypes, MVPs, custom builds",          to: "/services/mobile-apps" },
  { icon: Globe2,        title: "Domain Names",     label: ".ca, .com, DNS and email-ready",           to: "/domain" },
  { icon: Server,        title: "Web Hosting",      label: "Managed plans with SSL and backups",       to: "/hosting" },
  { icon: Megaphone,     title: "Marketing",        label: "Campaign setup and growth support",        to: "/services/marketing" },
  { icon: Share2,        title: "Social Media",     label: "Content, planning and publishing",         to: "/services/social-media" },
  { icon: MapPin,        title: "Local Visibility", label: "Maps, listings and local search",          to: "/services/local-listings" },
  { icon: Target,        title: "Lead Generation",  label: "Funnels and qualified leads",              to: "/services/lead-generation" },
  { icon: PhoneCall,     title: "VoIP",             label: "Business numbers, IVR and call flows",     to: "/services/voip" },
  { icon: Workflow,      title: "Automation",       label: "Workflows and AI-assisted operations",     to: "/services/ai-business-tools" },
  { icon: ClipboardList, title: "Data Entry",       label: "Clean data, catalogs and admin work",      to: "/marketplace/category/data_entry" },
  { icon: Utensils,      title: "Menu & Flyer",     label: "Menus, flyers and print design",           to: "/marketplace/category/menu_design" },
];

export function MarketplaceCategoryRail() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground md:text-2xl">Browse by category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Every TAKATAK service area, in one place.</p>
          </div>
          <Link to="/services" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            All services
          </Link>
        </div>

        {/* Mobile: horizontal rail. Desktop: grid. */}
        <ul className="mt-6 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.title} className="w-[230px] shrink-0 sm:w-auto">
                <Link
                  to={c.to as never}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[var(--shadow-card)]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={18} />
                  </span>
                  <span className="mt-3 text-sm font-semibold text-foreground">{c.title}</span>
                  <span className="mt-1 text-xs leading-5 text-muted-foreground">{c.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
