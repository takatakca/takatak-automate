import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Search, Server } from "lucide-react";
import { pricing, formatCAD } from "@/lib/pricing";

export function DomainHostingSpotlight() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">Start with your domain and hosting</h2>
        <p className="mt-2 text-sm text-muted-foreground">The foundation of every business online — set up and managed for you.</p>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Domain */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">Domain names</h3>
              <span className="text-sm font-bold text-foreground">
                from {formatCAD(pricing.domain.register.amount)}<span className="text-xs font-medium text-muted-foreground">/year</span>
              </span>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3">
              <Search size={16} className="shrink-0 text-primary" />
              <span className="min-w-0 truncate text-sm text-muted-foreground">yourbusiness.ca</span>
              <span className="ml-auto shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Search</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[".ca", ".com", "DNS management", "Email-ready"].map((t) => (
                <span key={t} className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">{t}</span>
              ))}
            </div>
            <Link to="/domain" className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-semibold text-primary hover:underline">
              Search domains <ArrowRight size={14} />
            </Link>
          </div>

          {/* Hosting */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">Web hosting</h3>
              <span className="text-sm font-bold text-foreground">
                from {formatCAD(pricing.hosting[0].amount)}<span className="text-xs font-medium text-muted-foreground">/month</span>
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {pricing.hosting.map((p) => (
                <div key={p.key} className="rounded-xl border border-border bg-background p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-primary"><Server size={14} /></div>
                  <div className="mt-1.5 text-xs font-semibold text-foreground">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{formatCAD(p.amount)}/mo</div>
                </div>
              ))}
            </div>
            <ul className="mt-4 grid gap-1.5">
              {["Free SSL and daily backups", "cPanel, staging and email", "Managed migration support"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check size={14} className="shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/hosting" className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-semibold text-primary hover:underline">
              View hosting plans <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
