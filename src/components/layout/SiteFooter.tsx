import { Link } from "@tanstack/react-router";
import { brand } from "@/lib/brand";

const cols = [
  {
    title: "Services",
    links: [
      { to: "/domain", label: "Domains" },
      { to: "/hosting", label: "Hosting" },
      { to: "/services/websites", label: "Websites" },
      { to: "/services/mobile-apps", label: "Mobile Apps" },
      { to: "/services/ai-business-tools", label: "AI Tools" },
    ],
  },
  {
    title: "Automation",
    links: [
      { to: "/services/marketing", label: "Marketing" },
      { to: "/services/social-media", label: "Social Media" },
      { to: "/services/local-listings", label: "Local Listings" },
      { to: "/services/lead-generation", label: "Lead Generation" },
      { to: "/services/voip", label: "VoIP" },
    ],
  },
  {
    title: "Marketplace",
    links: [
      { to: "/services/marketplace", label: "Browse services" },
      { to: "/dashboard/marketplace", label: "Post a project" },
      { to: "/dashboard/marketplace", label: "Become a freelancer" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/dashboard/invoices", label: "Billing" },
      { to: "/dashboard/support", label: "Support" },
      { to: "/login", label: "Sign in" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <h3 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {brand.brandName}
              </span>
            </h3>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              {brand.positioning}
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              {brand.supportEmail}
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.label}`}>
                    <Link to={l.to} className="hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row gap-3 justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {brand.legalName}. {brand.domain}</p>
          <p>Managed online services for growing businesses.</p>
        </div>
      </div>
    </footer>
  );
}