import { Link, useLocation } from "@tanstack/react-router";
import { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import {
  LayoutDashboard, Boxes, Globe, Server, Globe2, Megaphone, Share2,
  MapPin, Target, Phone, Sparkles, Store, ReceiptText, FileText,
  LifeBuoy, UserCog, Smartphone,
} from "lucide-react";

const nav: { to: string; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { to: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { to: "/dashboard/services", label: "All services", Icon: Boxes },
  { to: "/dashboard/domains", label: "Domains", Icon: Globe },
  { to: "/dashboard/hosting", label: "Hosting", Icon: Server },
  { to: "/dashboard/websites", label: "Websites", Icon: Globe2 },
  { to: "/dashboard/mobile-apps", label: "Mobile apps", Icon: Smartphone },
  { to: "/dashboard/marketing", label: "Marketing", Icon: Megaphone },
  { to: "/dashboard/social-media", label: "Social media", Icon: Share2 },
  { to: "/dashboard/local-listings", label: "Local listings", Icon: MapPin },
  { to: "/dashboard/leads", label: "Leads", Icon: Target },
  { to: "/dashboard/voip", label: "VoIP", Icon: Phone },
  { to: "/dashboard/ai-tools", label: "AI tools", Icon: Sparkles },
  { to: "/dashboard/marketplace", label: "Marketplace", Icon: Store },
  { to: "/dashboard/orders", label: "Orders", Icon: ReceiptText },
  { to: "/dashboard/invoices", label: "Invoices", Icon: FileText },
  { to: "/dashboard/support", label: "Support", Icon: LifeBuoy },
  { to: "/dashboard/account", label: "Account", Icon: UserCog },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  return (
    <SiteShell>
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <aside className="lg:sticky lg:top-24 self-start">
            <nav className="rounded-2xl border border-border bg-card p-2 overflow-x-auto lg:overflow-visible">
              <ul className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
                {nav.map(({ to, label, Icon }) => {
                  const active = loc.pathname === to ||
                    (to !== "/dashboard" && loc.pathname.startsWith(to));
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap ${
                          active
                            ? "bg-secondary text-foreground font-medium"
                            : "text-muted-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
          <main className="min-w-0">
            <div className="flex justify-end mb-4">
              <NotificationBell />
            </div>
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </SiteShell>
  );
}

export function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
