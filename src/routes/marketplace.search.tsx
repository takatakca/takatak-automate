import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PackageResultCard } from "@/components/marketplace/PackageResultCard";
import {
  searchPackages,
  PACKAGE_CATEGORIES_DISPLAY,
  shortestDelivery,
} from "@/lib/marketplacePackages";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplaceCategories";
import { getMarketplacePackages } from "@/lib/marketplaceCatalogApi";
import { CatalogSourceIndicator } from "@/components/dev/CatalogSourceIndicator";

export const Route = createFileRoute("/marketplace/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    category: typeof s.category === "string" ? s.category : "",
    sort: typeof s.sort === "string" ? s.sort : "recommended",
  }),
  head: () => ({ meta: [{ title: "Search marketplace — TAKATAK" }] }),
  component: Page,
});

function Page() {
  const { q, category, sort } = Route.useSearch();
  const navigate = Route.useNavigate();
  const local = searchPackages(q, category || undefined);
  const { data: remote } = useQuery({
    queryKey: ["marketplace", "packages", { q, category, sort }],
    queryFn: () =>
      getMarketplacePackages({
        q: q || undefined,
        category: category || undefined,
        sort: sort === "recommended" || sort === "price_asc" || sort === "delivery_asc" || sort === "category" || sort === "newest" ? sort : undefined,
      }),
    staleTime: 30_000,
  });
  const raw = remote?.data ?? local;
  const source = remote?.source;
  const packages = useMemo(() => {
    const arr = [...raw];
    if (sort === "price_asc") arr.sort((a, b) => Math.min(...a.tiers.map(t => t.priceCents)) - Math.min(...b.tiers.map(t => t.priceCents)));
    else if (sort === "price_desc") arr.sort((a, b) => Math.min(...b.tiers.map(t => t.priceCents)) - Math.min(...a.tiers.map(t => t.priceCents)));
    else if (sort === "delivery") arr.sort((a, b) => shortestDelivery(a) - shortestDelivery(b));
    else if (sort === "rating") arr.sort((a, b) => b.rating - a.rating);
    return arr;
  }, [raw, sort]);
  const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === category);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <CatalogSourceIndicator source={source} />
      <div className="flex flex-col gap-2">
        <Link to="/marketplace" className="text-xs text-muted-foreground hover:text-foreground">← Back to marketplace</Link>
        <h1 className="text-3xl font-bold">
          {q ? `Marketplace results for "${q}"` : cat ? cat.name : "Browse marketplace packages"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Every TAKATAK package is delivered by a vetted freelancer. Payment is held in escrow and released only after you approve the work.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-border py-3 text-sm">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Category</label>
        <select
          value={category}
          onChange={(e) => void navigate({ search: (p: { q: string; category: string; sort: string }) => ({ ...p, category: e.target.value }) })}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {PACKAGE_CATEGORIES_DISPLAY.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <label className="text-xs uppercase tracking-wider text-muted-foreground ml-2">Sort</label>
        <select
          value={sort}
          onChange={(e) => void navigate({ search: (p: { q: string; category: string; sort: string }) => ({ ...p, sort: e.target.value }) })}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="recommended">Recommended</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="delivery">Fastest delivery</option>
          <option value="rating">Highest rated</option>
        </select>
        <span className="ml-auto text-xs text-muted-foreground">{packages.length} result{packages.length === 1 ? "" : "s"}</span>
        <Link to="/marketplace/post-project" className="px-3 py-1.5 rounded-md text-xs font-semibold border border-border hover:bg-secondary">
          Post a custom project
        </Link>
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
