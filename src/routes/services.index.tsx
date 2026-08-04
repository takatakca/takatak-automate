import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { services } from "@/lib/services";
import { serviceStartingPrice, formatCAD, cadenceLabel } from "@/lib/pricing";

const groups = [
  { key: "infrastructure", title: "Infrastructure" },
  { key: "build", title: "Build" },
  { key: "growth", title: "Growth" },
  { key: "communication", title: "Communication" },
  { key: "marketplace", title: "Marketplace" },
] as const;

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "All Services — TAKATAK" },
      { name: "description", content: "Every TAKATAK service: domains, hosting, websites, apps, marketing, social, local visibility, leads, VoIP, automation and marketplace talent." },
      { property: "og:title", content: "All Services — TAKATAK" },
      { property: "og:description", content: "Domains, hosting, websites, apps, marketing, VoIP, automation and vetted marketplace talent — all in CAD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">All services</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Every service TAKATAK delivers, with managed setup and Canadian support. Prices in CAD.
        </p>
        <Link to="/pricing" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          See full pricing <ArrowRight size={14} />
        </Link>

        {groups.map((g) => {
          const items = services.filter((s) => s.category === g.key);
          if (!items.length) return null;
          return (
            <section key={g.key} className="mt-12">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{g.title}</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => {
                  const price = serviceStartingPrice[s.key];
                  return (
                    <Link
                      key={s.key}
                      to={s.publicRoute as never}
                      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/45"
                    >
                      <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.shortDescription}</p>
                      <div className="mt-auto flex items-center justify-between pt-5">
                        {price && (
                          <span className="text-sm font-bold text-foreground">
                            from {formatCAD(price.amount)}
                            <span className="text-xs font-medium text-muted-foreground">{cadenceLabel(price.cadence)}</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                          {s.ctaLabel} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </SiteShell>
  );
}
