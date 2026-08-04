import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X, Search, ChevronDown, ArrowRight, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { serviceGroups, fromLabel, type NavItem } from "@/lib/navigation";
import { openLiveChat } from "@/lib/chatProvider";

const directNav = [
  { to: "/marketplace", key: "nav.marketplace" as const },
  { to: "/pricing", key: "nav.pricing" as const },
  { to: "/services", key: "nav.allServices" as const },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>("build");
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const { isAuthenticated, logout } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const megaRef = useRef<HTMLLIElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close every surface on route change.
  useEffect(() => {
    setMegaOpen(false);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  const submitSearch = () => {
    if (!q.trim()) return;
    void navigate({ to: "/marketplace/search", search: { q } as never });
  };

  const renderItem = (item: NavItem, onClick?: () => void) => (
    <Link
      key={`${item.to}-${item.label.en}`}
      to={item.to}
      onClick={onClick}
      className="group block rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-secondary/60 focus-visible:border-border focus-visible:bg-secondary/60"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">{item.label[lang]}</span>
        {item.from && (
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {t("nav.from")} {fromLabel(lang, item.from.amount, item.from.cadence)}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.outcome[lang]}</p>
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-border bg-background/85 backdrop-blur-xl shadow-[0_18px_40px_-32px_rgba(0,0,0,0.9)]"
          : "border-transparent bg-background"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-1.5" aria-label="TAKATAK home">
          <span className="text-[22px] font-extrabold tracking-tight text-foreground">TAKATAK</span>
          <span className="mt-3 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
        </Link>

        <ul className="ml-2 hidden items-center gap-0.5 text-[13px] font-medium lg:flex">
          <li
            ref={megaRef}
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2 text-foreground/75 transition-colors hover:text-foreground"
              onClick={() => setMegaOpen(true)}
              onFocus={() => setMegaOpen(true)}
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              {t("nav.solutions")}
              <ChevronDown size={13} className={megaOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            {megaOpen && (
              <div className="absolute left-0 top-full w-[min(78vw,940px)] pt-3">
                <div className="tk-reveal rounded-2xl border border-border bg-popover/98 p-5 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <div className="grid grid-cols-3 gap-5">
                    {serviceGroups.map((group) => (
                      <div key={group.key}>
                        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          {group.label[lang]}
                        </p>
                        <div className="space-y-0.5">
                          {group.items.map((item) => renderItem(item, () => setMegaOpen(false)))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">{t("nav.megaFooter")}</p>
                    <div className="flex items-center gap-2">
                      <Link
                        to="/services"
                        onClick={() => setMegaOpen(false)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"
                      >
                        {t("nav.allServices")} <ArrowRight size={13} />
                      </Link>
                      <Link
                        to="/marketplace/post-project"
                        onClick={() => setMegaOpen(false)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      >
                        {t("nav.startProject")} <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </li>
          {directNav.map((n) => (
            <li key={n.to}>
              <Link
                to={n.to}
                className="whitespace-nowrap rounded-md px-2.5 py-2 text-foreground/75 transition-colors hover:text-foreground"
                activeProps={{ className: "px-2.5 py-2 rounded-md text-foreground whitespace-nowrap" }}
              >
                {t(n.key)}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => openLiveChat({ page: pathname, intent: "header", lang })}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-2 text-foreground/75 transition-colors hover:text-foreground"
            >
              <MessageSquare size={13} /> {t("nav.talk")}
            </button>
          </li>
        </ul>

        <div className="ml-auto hidden flex-1 justify-end md:flex lg:max-w-sm">
          <div className="flex w-full items-stretch overflow-hidden rounded-md border border-border bg-card transition-colors focus-within:border-foreground/60">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
              placeholder={t("search.placeholder")}
              className="min-w-0 flex-1 bg-transparent px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              aria-label={t("search.aria")}
            />
            <button
              onClick={submitSearch}
              className="flex items-center justify-center bg-foreground px-3.5 text-background transition-opacity hover:opacity-90"
              aria-label={t("search.go")}
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        <div className="ml-2 hidden shrink-0 items-center gap-1 lg:flex">
          <LanguageSwitcher className="mr-1" />
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="whitespace-nowrap rounded-md px-3 py-2 text-[13px] font-medium hover:bg-secondary">
                {t("nav.dashboard")}
              </Link>
              <button
                onClick={() => void logout()}
                className="whitespace-nowrap rounded-md border border-border px-3 py-2 text-[13px] font-medium hover:bg-secondary"
              >
                {t("nav.signout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="whitespace-nowrap rounded-md px-3 py-2 text-[13px] font-medium text-foreground/80 hover:text-foreground">
                {t("nav.signin")}
              </Link>
              <Link
                to="/marketplace/post-project"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
              >
                {t("nav.startProject")} <ArrowRight size={13} />
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="ml-auto rounded-md p-2 hover:bg-secondary lg:hidden"
          aria-label={open ? t("nav.close") : t("nav.menu")}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background px-4 py-3 lg:hidden">
          <div className="mb-3 flex items-stretch overflow-hidden rounded-md border border-border bg-card">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setOpen(false); submitSearch(); } }}
              placeholder={t("search.placeholder")}
              aria-label={t("search.aria")}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
            />
            <button onClick={() => { setOpen(false); submitSearch(); }} className="bg-foreground px-3 text-background" aria-label={t("search.go")}>
              <Search size={16} />
            </button>
          </div>

          <div className="space-y-1.5">
            {serviceGroups.map((group) => {
              const expanded = mobileGroup === group.key;
              return (
                <div key={group.key} className="rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setMobileGroup(expanded ? null : group.key)}
                    aria-expanded={expanded}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-left"
                  >
                    <span className="truncate text-sm font-semibold">{group.label[lang]}</span>
                    <ChevronDown size={16} className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  {expanded && <div className="space-y-0.5 border-t border-border p-1.5">{group.items.map((item) => renderItem(item, () => setOpen(false)))}</div>}
                </div>
              );
            })}
          </div>

          <div className="mt-3 space-y-1">
            {directNav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-secondary">
                {t(n.key)}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => { setOpen(false); openLiveChat({ page: pathname, intent: "header", lang }); }}
              className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-secondary"
            >
              {t("nav.talk")}
            </button>
          </div>

          <div className="pt-3">
            <LanguageSwitcher />
          </div>

          <div className="mt-3 flex gap-2 border-t border-border pt-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="flex-1 rounded-md border border-border px-3 py-2.5 text-center text-sm">
                  {t("nav.dashboard")}
                </Link>
                <button onClick={() => { setOpen(false); void logout(); }} className="flex-1 rounded-md border border-border px-3 py-2.5 text-sm">
                  {t("nav.signout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-md border border-border px-3 py-2.5 text-center text-sm">
                  {t("nav.signin")}
                </Link>
                <Link
                  to="/marketplace/post-project"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                >
                  {t("nav.startProject")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}