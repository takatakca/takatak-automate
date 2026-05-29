import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  TrendingUp, Palette, Code2, Megaphone, PenLine, Video,
  Briefcase, Bot, MapPin, Database,
} from "lucide-react";

const primaryNav = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/domain", label: "Domains" },
  { to: "/hosting", label: "Hosting" },
  { to: "/services/local-listings", label: "QMAPS" },
  { to: "/services/lead-generation", label: "FLEXS" },
  { to: "/services/ai-business-tools", label: "AI Tools" },
] as const;

const moreNav = [
  { to: "/deals", label: "Today's Deals" },
  { to: "/services/websites", label: "Websites" },
  { to: "/services/mobile-apps", label: "Mobile Apps" },
  { to: "/services/voip", label: "VoIP" },
  { to: "/services/marketing", label: "Marketing" },
  { to: "/services/social-media", label: "Social Media" },
] as const;

const allNav = [...primaryNav, ...moreNav];

const CATEGORY_BAR = [
  { icon: TrendingUp, label: "Trending", slug: "logo_design" },
  { icon: Palette, label: "Graphics & Design", slug: "logo_design" },
  { icon: Code2, label: "Programming & Tech", slug: "website_design" },
  { icon: Megaphone, label: "Digital Marketing", slug: "online_advertising" },
  { icon: PenLine, label: "Writing & Translation", slug: "content_writing" },
  { icon: Video, label: "Video & Animation", slug: "social_media_content" },
  { icon: Briefcase, label: "Business", slug: "virtual_assistance" },
  { icon: Bot, label: "AI Services", slug: "ai_tool_setup" },
  { icon: MapPin, label: "Local Visibility", slug: "seo_local_visibility" },
  { icon: Database, label: "Data", slug: "data_entry" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [q, setQ] = useState("");
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const submitSearch = () => {
    if (!q.trim()) return;
    void navigate({ to: "/marketplace/search", search: { q } as never });
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="max-w-7xl mx-auto flex items-center px-4 h-16 gap-5">
        <Link to="/" className="flex items-center gap-1.5 shrink-0" aria-label="TAKATAK home">
          <span className="text-[22px] font-extrabold tracking-tight text-foreground">TAKATAK</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-3" aria-hidden />
        </Link>
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="flex items-stretch w-full rounded-md border border-border bg-card overflow-hidden focus-within:border-foreground/60 transition-colors">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
              placeholder="What service are you looking for today?"
              className="flex-1 bg-transparent outline-none px-3.5 text-sm min-w-0 text-foreground placeholder:text-muted-foreground"
              aria-label="Search marketplace"
            />
            <button
              onClick={submitSearch}
              className="px-3.5 bg-foreground text-background hover:opacity-90 transition-opacity flex items-center justify-center"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
        <ul className="hidden lg:flex items-center gap-0.5 text-[13px] font-medium ml-auto">
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
              More <ChevronDown size={13} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full pt-2 w-56">
                <div className="rounded-lg border border-border bg-popover shadow-lg p-1">
                  {moreNav.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setMoreOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm text-foreground/80 hover:text-foreground hover:bg-secondary"
                    >
                      {n.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>
        </ul>
        <div className="hidden lg:flex items-center gap-1 ml-2 shrink-0">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="px-3 py-2 text-[13px] font-medium rounded-md hover:bg-secondary whitespace-nowrap"
              >
                Dashboard
              </Link>
              <button
                onClick={() => void logout()}
                className="px-3 py-2 text-[13px] font-medium rounded-md border border-border hover:bg-secondary whitespace-nowrap"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-2 text-[13px] font-medium text-foreground/80 hover:text-foreground rounded-md whitespace-nowrap"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-2 text-[13px] font-semibold rounded-md text-primary-foreground bg-primary hover:opacity-90 whitespace-nowrap"
              >
                Get started
              </Link>
            </>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-md hover:bg-secondary ml-auto"
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {/* Secondary category bar (desktop) */}
      <div className="hidden md:block border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex gap-1 overflow-x-auto py-1.5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {CATEGORY_BAR.map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.label} className="shrink-0">
                  <Link
                    to="/marketplace/category/$slug"
                    params={{ slug: c.slug }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12.5px] text-foreground/70 hover:text-foreground hover:bg-secondary whitespace-nowrap transition-colors"
                  >
                    <Icon size={13} className="text-primary" />
                    {c.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          <div className="pb-3 mb-2 border-b border-border">
            <div className="flex items-stretch w-full rounded-md border border-border bg-card overflow-hidden">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setOpen(false); submitSearch(); } }}
                placeholder="Search services…"
                className="flex-1 bg-transparent outline-none px-3 py-2.5 text-sm min-w-0"
              />
              <button
                onClick={() => { setOpen(false); submitSearch(); }}
                className="px-3 bg-foreground text-background"
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            </div>
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