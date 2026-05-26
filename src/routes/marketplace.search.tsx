import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { localSearch } from "@/lib/searchCatalog";

const schema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/marketplace/search")({
  validateSearch: zodValidator(schema),
  head: () => ({ meta: [{ title: "Search marketplace — TAKATAK" }] }),
  component: Page,
});

function Page() {
  const { q, category } = Route.useSearch();
  const results = localSearch(q, category || undefined).filter(
    (r) => r.kind === "marketplace_category" || r.kind === "freelance" || r.kind === "action",
  );
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">{q ? `Marketplace results for "${q}"` : "Search the marketplace"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Browse categories or post a custom project for vetted TAKATAK talent.</p>
      {results.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
          <h3 className="font-semibold">No matching packages yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Post your project and TAKATAK will assign a vetted freelancer.</p>
          <Link to="/marketplace/post-project" className="mt-4 inline-block px-4 py-2 rounded-md text-sm font-medium text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>
            Post a project
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
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
    </div>
  );
}