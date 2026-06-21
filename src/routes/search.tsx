import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { ServiceAdvisor } from "@/components/marketplace/ServiceAdvisor";
import { PackageResultCard } from "@/components/marketplace/PackageResultCard";
import { searchPackages } from "@/lib/marketplacePackages";
import { localSearch, classifyIntent } from "@/lib/searchCatalog";
import { getMarketplacePackages } from "@/lib/marketplaceCatalogApi";
import { CatalogSourceIndicator } from "@/components/dev/CatalogSourceIndicator";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    category: typeof s.category === "string" ? s.category : "",
  }),
  head: () => ({ meta: [{ title: "Search — TAKATAK" }] }),
  component: Page,
});

function Page() {
  const { q, category } = Route.useSearch();
  const local = searchPackages(q, category || undefined);
  const { data: remote } = useQuery({
    queryKey: ["marketplace", "packages", { q, category, scope: "global-search" }],
    queryFn: () =>
      getMarketplacePackages({ q: q || undefined, category: category || undefined }),
    staleTime: 30_000,
  });
  const packages = remote?.data ?? local;
  const source = remote?.source;
  const otherResults = localSearch(q, category || undefined).filter(
    (r) => r.kind === "domain" || r.kind === "hosting" || r.kind === "service" || r.kind === "action",
  );
  const intent = q ? classifyIntent(q) : "unknown";

  return (
    <SiteShell>
      <div className="market-light min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          <CatalogSourceIndicator source={source} />
          <header>
            <h1 className="text-3xl font-bold">{q ? `Results for "${q}"` : "Search TAKATAK"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Marketplace packages, domains, hosting, services and TAKATAK products in one place.
            </p>
          </header>

          {intent === "domain" && q && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
              Looks like a domain query. <Link to="/domain" className="font-medium text-primary hover:underline">Search & register →</Link>
            </div>
          )}
          {intent === "hosting" && q && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
              Looking for hosting? <Link to="/hosting" className="font-medium text-primary hover:underline">View hosting plans →</Link>
            </div>
          )}
          {intent === "qmaps" && q && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
              Local listings? <Link to="/services/local-listings" className="font-medium text-primary hover:underline">Explore QMAPS →</Link>
            </div>
          )}
          {intent === "flexs" && q && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
              Need leads? <Link to="/services/lead-generation" className="font-medium text-primary hover:underline">Explore FLEXS →</Link>
            </div>
          )}

          <section>
            <div className="flex items-end justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Marketplace packages {packages.length > 0 && <span className="text-foreground/60">({packages.length})</span>}
              </h2>
              <Link to="/marketplace" className="text-xs text-primary hover:underline">Browse all categories</Link>
            </div>

            {packages.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <h3 className="font-semibold text-foreground">No matching package yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Post a custom project and TAKATAK will assign a vetted freelancer within 24 hours.
                </p>
                <Link
                  to="/marketplace/post-project"
                  className="mt-4 inline-block px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90"
                >
                  Post a project
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {packages.map((p) => <PackageResultCard key={p.id} pkg={p} />)}
              </div>
            )}
          </section>

          {otherResults.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Also on TAKATAK</h2>
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
                {otherResults.map((r) => (
                  <li key={r.id}>
                    <Link to={r.to} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-secondary/40">
                      <span className="truncate text-foreground">{r.title}</span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.kind.replace("_", " ")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ServiceAdvisor defaultQuery={q} />
        </div>
      </div>
    </SiteShell>
  );
}
