import { ArrowRight, ShieldCheck, Headset, Star, Zap, Server, Rocket, Globe } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AiServiceSearch } from "./AiServiceSearch";
import { HeroSystemMap } from "./HeroSystemMap";
import { openLiveChat } from "@/lib/chatProvider";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/lib/i18n";

const CHIPS: readonly { key: TranslationKey; to: string }[] = [
  { key: "cat.websites.title",   to: "/services/websites" },
  { key: "cat.branding.title",   to: "/marketplace/category/logo_design" },
  { key: "cat.domains.title",    to: "/domain" },
  { key: "cat.hosting.title",    to: "/hosting" },
  { key: "cat.marketing.title",  to: "/services/marketing" },
  { key: "home.chip.local",      to: "/services/local-listings" },
  { key: "home.chip.leads",      to: "/services/lead-generation" },
  { key: "cat.voip.title",       to: "/services/voip" },
  { key: "cat.automation.title", to: "/services/ai-business-tools" },
];

export function PremiumHero() {
  const { t } = useLanguage();
  return (
    <section className="brand-dark relative overflow-hidden border-b border-border">
      {/* Ambient gradient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(1200px 500px at 85% -10%, color-mix(in oklab, var(--brand-accent-violet) 22%, transparent), transparent 60%), radial-gradient(900px 500px at -10% 110%, color-mix(in oklab, var(--brand-accent-cyan) 20%, transparent), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--brand-accent-cyan), var(--brand-accent-violet), transparent)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand-dark-border) 1px, transparent 1px), linear-gradient(90deg, var(--brand-dark-border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 45%, transparent 85%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden items-center justify-center text-foreground opacity-40 md:flex">
        <div className="h-[300px] w-full max-w-6xl">
          <HeroSystemMap />
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-foreground/85 backdrop-blur">
            <Globe size={12} className="text-primary" />
            {t("home.hero.badge")}
          </span>
          <h1 className="mt-5 text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[46px]">
            {t("home.hero.title")}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            {t("home.hero.subtitle")}
          </p>

          <div className="mt-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("home.hero.searchLabel")}
            </p>
            <AiServiceSearch />
          </div>

          <ul className="mt-5 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <li key={c.key}>
                <Link
                  to={c.to as never}
                  className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground/85 hover:bg-white/10"
                >
                  {t(c.key)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {t("home.hero.ctaMarketplace")} <ArrowRight size={15} />
            </Link>
            <Link
              to="/domain"
              className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/10"
            >
              {t("home.hero.ctaDomains")}
            </Link>
            <button
              type="button"
              onClick={() => openLiveChat({ page: "/" })}
              className="inline-flex items-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-foreground/85 underline-offset-4 hover:text-foreground hover:underline"
            >
              <Headset size={15} className="text-primary" /> {t("home.hero.ctaChat")}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-primary" /> {t("home.hero.trust.escrow")}</span>
            <span className="inline-flex items-center gap-1.5"><Star size={13} className="text-primary" /> {t("home.hero.trust.managed")}</span>
            <span className="inline-flex items-center gap-1.5"><Zap size={13} className="text-primary" /> {t("home.hero.trust.cad")}</span>
          </div>
        </div>

        {/* Right-side dashboard mockup */}
        <div className="relative hidden lg:block">
          <div className="relative h-[520px] w-full">
            {/* Backdrop card */}
            <div className="absolute inset-4 rounded-3xl border border-white/10 bg-white/[0.04]" />

            {/* Main dashboard panel */}
            <div className="absolute right-0 top-6 w-[86%] rounded-2xl border border-white/10 bg-[color:var(--brand-dark-surface,rgba(20,20,28,0.9))] p-4 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-foreground/80">dashboard.takatak.ca</div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: t("home.hero.mock.services"), value: "12" },
                  { label: t("home.hero.mock.projects"),  value: "4" },
                  { label: "MRR",              value: "$2,847" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                    <div className="mt-1 text-lg font-bold text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-foreground">{t("home.hero.mock.pipeline")}</div>
                  <div className="text-[10px] text-muted-foreground">{t("home.hero.mock.week")}</div>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    { name: t("home.hero.mock.row1"), pct: 100, tone: "cyan"   },
                    { name: t("home.hero.mock.row2"), pct: 82,  tone: "violet" },
                    { name: t("home.hero.mock.row3"), pct: 54,  tone: "cyan"   },
                    { name: t("home.hero.mock.row4"), pct: 32,  tone: "violet" },
                  ].map((row) => (
                    <div key={row.name} className="grid grid-cols-[1fr_auto] items-center gap-2 text-[11px]">
                      <div className="min-w-0">
                        <div className="truncate text-foreground/90">{row.name}</div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.pct}%`,
                              background:
                                row.tone === "cyan"
                                  ? "linear-gradient(90deg, var(--brand-accent-cyan), color-mix(in oklab, var(--brand-accent-cyan) 40%, transparent))"
                                  : "linear-gradient(90deg, var(--brand-accent-violet), color-mix(in oklab, var(--brand-accent-violet) 40%, transparent))",
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-muted-foreground">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating pricing chip */}
            <div className="absolute left-0 top-40 w-56 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-md shadow-[0_25px_60px_-25px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary"><Server size={16} /></div>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("home.hero.mock.hosting")}</div>
                  <div className="truncate text-sm font-bold text-foreground">$39.99<span className="text-xs font-medium text-muted-foreground">{t("cadence.monthly")}</span></div>
                </div>
              </div>
            </div>

            {/* Floating service badge */}
            <div className="absolute bottom-8 left-6 w-64 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-md shadow-[0_25px_60px_-25px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary"><Rocket size={16} /></div>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("home.hero.mock.website")}</div>
                  <div className="truncate text-sm font-bold text-foreground">{t("price.from")} $1,499 <span className="text-xs font-medium text-muted-foreground">CAD</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}