import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageResultCard } from "@/components/marketplace/PackageResultCard";
import { searchPackages } from "@/lib/marketplacePackages";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplaceCategories";

export const Route = createFileRoute("/marketplace/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    category: typeof s.category === "string" ? s.category : "",
  }),
  head: () => ({ meta: [{ title: "Search marketplace — TAKATAK" }] }),
  component: Page,
});

function Page() {
  const { q, category } = Route.useSearch();
  const packages = searchPackages(q, category || undefined);
  const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === category);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col gap-2">
        <Link to="/marketplace" className="text-xs text-muted-foreground hover:text-foreground">← Back to marketplace</Link>
        <h1 className="text-3xl font-bold">
          {q ? `Marketplace results for "${q}"` : cat ? cat.name : "Browse marketplace packages"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Every TAKATAK package is delivered by a vetted freelancer. Payment is held in escrow and released only after you approve the work.
        </p>
      </div>

      {packages.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h3 className="font-semibold">No matching package yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Post your project and TAKATAK will assign a vetted freelancer within 24 hours.
          </p>
          <Link
            to="/marketplace/post-project"
            className="mt-4 inline-block px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90"
          >
            Post a project
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((p) => <PackageResultCard key={p.id} pkg={p} />)}
        </div>
      )}
    </div>
  );
}
