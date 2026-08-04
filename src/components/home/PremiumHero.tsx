import { ArrowRight, ShieldCheck, Sparkles, Star, Zap, Server, Rocket } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AiServiceSearch } from "./AiServiceSearch";

const CHIPS = [
  { label: "Website", to: "/services/websites" },
  { label: "Logo", to: "/marketplace/category/logo_design" },
  { label: "Domain", to: "/domain" },
  { label: "Hosting", to: "/hosting" },
  { label: "Marketing", to: "/services/marketing" },
  { label: "Local visibility", to: "/services/local-listings" },
  { label: "Leads", to: "/services/lead-generation" },
  { label: "VoIP", to: "/services/voip" },
  { label: "Automation", to: "/services/ai-business-tools" },
];

export function PremiumHero() {
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

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-foreground/85 backdrop-blur">
            <Sparkles size={12} className="text-primary" />
            Canadian business platform
          </span>
          <h1 className="mt-5 text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[46px]">
            Business services, websites, domains, hosting, and digital growth —{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, var(--brand-accent-cyan), var(--brand-accent-violet))" }}
            >
              all in one TAKATAK platform
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Find the right service, launch a project, manage delivery, and grow your business with
            professional support and smart tools.
          </p>

          <div className="mt-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Tell TAKATAK what you need
            </p>
            <AiServiceSearch />
          </div>

          <ul className="mt-5 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <li key={c.label}>
                <Link
                  to={c.to as never}
                  className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground/85 hover:bg-white/10"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Browse marketplace <ArrowRight size={15} />
            </Link>
            <Link
              to="/domain"
              className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/10"
            >
              Search domains
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-primary" /> Escrow protected</span>
            <span className="inline-flex items-center gap-1.5"><Star size={13} className="text-primary" /> Managed delivery</span>
            <span className="inline-flex items-center gap-1.5"><Zap size={13} className="text-primary" /> CAD billing</span>
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
                  { label: "Active services", value: "12" },
                  { label: "Open projects",   value: "4" },
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
                  <div className="text-xs font-semibold text-foreground">Delivery pipeline</div>
                  <div className="text-[10px] text-muted-foreground">This week</div>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    { name: "yourbrand.ca — DNS live",     pct: 100, tone: "cyan"   },
                    { name: "Silver hosting provisioned",  pct: 82,  tone: "violet" },
                    { name: "Business website — design",   pct: 54,  tone: "cyan"   },
                    { name: "Local listings — Maps",       pct: 32,  tone: "violet" },
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
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Silver hosting</div>
                  <div className="truncate text-sm font-bold text-foreground">$39.99<span className="text-xs font-medium text-muted-foreground">/mo</span></div>
                </div>
              </div>
            </div>

            {/* Floating service badge */}
            <div className="absolute bottom-8 left-6 w-64 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-md shadow-[0_25px_60px_-25px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary"><Rocket size={16} /></div>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Business Website</div>
                  <div className="truncate text-sm font-bold text-foreground">from $1,499 <span className="text-xs font-medium text-muted-foreground">CAD</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}