import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { brand } from "@/lib/brand";
import { useAuth } from "@/lib/auth-context";
import { GlobalSearchBar } from "@/components/search/GlobalSearchBar";

const nav = [
  { to: "/deals", label: "Today's Deals" },
  { to: "/domain", label: "Domains" },
  { to: "/hosting", label: "Hosting" },
  { to: "/services/websites", label: "Websites" },
  { to: "/services/mobile-apps", label: "Mobile Apps" },
  { to: "/services/local-listings", label: "QMAPS" },
  { to: "/services/lead-generation", label: "FLEXS" },
  { to: "/services/voip", label: "VoIP" },
  { to: "/services/marketing", label: "Marketing" },
  { to: "/services/social-media", label: "Social" },
  { to: "/services/ai-business-tools", label: "AI Tools" },
  { to: "/marketplace", label: "Marketplace" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="bg-secondary/40 text-xs text-muted-foreground px-4 py-1.5 text-center truncate">
        {brand.topBar}
      </div>
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {brand.brandName}
          </span>
        </Link>
        <div className="hidden md:block flex-1 max-w-md">
          <GlobalSearchBar />
        </div>
        <ul className="hidden xl:flex items-center gap-0.5 text-xs">
          {nav.map((n) => (
            <li key={n.to}>
              <Link
                to={n.to}
                className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                activeProps={{ className: "px-3 py-2 rounded-md text-foreground bg-secondary/50" }}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden lg:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-secondary/50"
              >
                Dashboard
              </Link>
              <button
                onClick={() => void logout()}
                className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-secondary/50"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-secondary/50"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-semibold rounded-md text-primary-foreground"
                style={{ backgroundImage: "var(--gradient-hero)" }}
              >
                Start with TAKATAK
              </Link>
            </>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-md hover:bg-secondary/50"
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 px-4 py-3 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md text-sm hover:bg-secondary/50"
            >
              {n.label}
            </Link>
          ))}
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
                  className="flex-1 text-center px-3 py-2 rounded-md text-sm font-semibold text-primary-foreground"
                  style={{ backgroundImage: "var(--gradient-hero)" }}
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