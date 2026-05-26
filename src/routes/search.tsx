import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { SiteShell } from "@/components/layout/SiteShell";
import { ServiceAdvisor } from "@/components/marketplace/ServiceAdvisor";
import { localSearch, classifyIntent } from "@/lib/searchCatalog";

const schema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(schema),
  head: () => ({ meta: [{ title: "Search — TAKATAK" }] }),
  component: Page,
});

function Page() {
  const { q, category } = Route.useSearch();
  const results = localSearch(q, category || undefined);
  const intent = q ? classifyIntent(q) : "unknown";
  return (
    <SiteShell>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header>
          <h1 className="text-3xl font-bold">{q ? `Results for "${q}"` : "Search TAKATAK"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Domains, hosting, services, QMAPS, FLEXS, AI tools and the marketplace.</p>
        </header>

        {intent === "domain" && q && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
            Looks like a domain query. <Link to="/domain" className="font-medium text-primary hover:underline">Search & register →</Link>
          </div>
        )}
        {intent === "hosting" && q && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
            Looking for hosting? <Link to="/hosting" className="font-medium text-primary hover:underline">View hosting plans →</Link> · already have a domain? Continue at checkout.
          </div>
        )}
        {intent === "freelance" && q && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
            Sounds like custom work. <Link to="/marketplace/post-project" className="font-medium text-primary hover:underline">Post a project →</Link>
          </div>
        )}

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Matches</h2>
          {results.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No matches. Try the AI Advisor below.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
              {results.map((r) => (
                <li key={r.id}>
                  <Link to={r.to} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-secondary/40">
                    <span className="truncate">{r.title}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.kind.replace("_", " ")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <ServiceAdvisor defaultQuery={q} />
      </div>
    </SiteShell>
  );
}