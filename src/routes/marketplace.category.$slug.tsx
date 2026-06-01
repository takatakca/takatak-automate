import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getCategory } from "@/lib/marketplaceCategories";
import {
  getPackagesByCategory,
  shortestDelivery,
  PACKAGE_CATEGORIES_DISPLAY,
} from "@/lib/marketplacePackages";
import { PackageResultCard } from "@/components/marketplace/PackageResultCard";
import { ShieldCheck, Clock, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/marketplace/category/$slug")({
  loader: ({ params }) => {
    // Resolve against the global category list OR the live package catalog.
    const cat =
      getCategory(params.slug) ??
      PACKAGE_CATEGORIES_DISPLAY.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { category: cat };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.category.name ?? "Category"} — TAKATAK Marketplace` },
      { name: "description", content: `Browse ${loaderData?.category.name ?? ""} packages on the TAKATAK marketplace.` },
    ],
  }),
  notFoundComponent: () => (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Category not found</h1>
      <Link to="/marketplace" className="mt-4 inline-block text-primary hover:underline">Back to marketplace</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <button onClick={reset} className="mt-4 px-4 py-2 rounded-md border border-border">Retry</button>
    </div>
  ),
  component: Page,
});

function Page() {
  const { category } = Route.useLoaderData();
  const packages = useMemo(() => getPackagesByCategory(category.slug), [category.slug]);

  const [maxBudget, setMaxBudget] = useState<string>("");
  const [maxDelivery, setMaxDelivery] = useState<string>("");
  const [intakeOnly, setIntakeOnly] = useState(false);
  const [quoteOnly, setQuoteOnly] = useState(false);
  const [sort, setSort] = useState("recommended");

  const filtered = useMemo(() => {
    let arr = packages.slice();
    if (maxBudget) {
      const cents = Math.round(parseFloat(maxBudget) * 100);
      if (!Number.isNaN(cents)) {
        arr = arr.filter((p) => Math.min(...p.tiers.map((t) => t.priceCents)) <= cents);
      }
    }
    if (maxDelivery) {
      const days = parseInt(maxDelivery, 10);
      if (!Number.isNaN(days)) arr = arr.filter((p) => shortestDelivery(p) <= days);
    }
    if (intakeOnly) arr = arr.filter((p) => p.intakeRequired);
    if (quoteOnly) arr = arr.filter((p) => p.quoteAvailable);
    if (sort === "price_asc")
      arr.sort((a, b) => Math.min(...a.tiers.map((t) => t.priceCents)) - Math.min(...b.tiers.map((t) => t.priceCents)));
    else if (sort === "price_desc")
      arr.sort((a, b) => Math.min(...b.tiers.map((t) => t.priceCents)) - Math.min(...a.tiers.map((t) => t.priceCents)));
    else if (sort === "delivery") arr.sort((a, b) => shortestDelivery(a) - shortestDelivery(b));
    else if (sort === "rating") arr.sort((a, b) => b.rating - a.rating);
    return arr;
  }, [packages, maxBudget, maxDelivery, intakeOnly, quoteOnly, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <header className="border-b border-border pb-6">
        <Link to="/marketplace" className="text-xs text-muted-foreground hover:text-foreground">← Marketplace</Link>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-foreground">{category.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Vetted TAKATAK freelancers delivering {category.name.toLowerCase()} with clear scope, fixed prices and escrow protection.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-primary" /> Escrow protected</span>
          <span className="inline-flex items-center gap-1.5"><Clock size={13} className="text-primary" /> Avg. delivery 3–7 days</span>
          <span className="inline-flex items-center gap-1.5"><BadgeCheck size={13} className="text-primary" /> Verified by Groupe TAKATAK</span>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 border-y border-border py-3 text-sm">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Max budget (CAD)</label>
          <input
            value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)}
            type="number" min="0" placeholder="Any"
            className="w-28 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Max delivery (days)</label>
          <input
            value={maxDelivery} onChange={(e) => setMaxDelivery(e.target.value)}
            type="number" min="1" placeholder="Any"
            className="w-28 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sort</label>
          <select
            value={sort} onChange={(e) => setSort(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="recommended">Recommended</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="delivery">Fastest delivery</option>
            <option value="rating">Highest rated</option>
          </select>
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-foreground">
          <input type="checkbox" checked={intakeOnly} onChange={(e) => setIntakeOnly(e.target.checked)} />
          Requires intake
        </label>
        <label className="inline-flex items-center gap-2 text-xs text-foreground">
          <input type="checkbox" checked={quoteOnly} onChange={(e) => setQuoteOnly(e.target.checked)} />
          Quote available
        </label>
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {packages.length} packages</span>
      </div>

      <section>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <h3 className="font-semibold text-foreground">No packages match your filters yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Post a {category.name.toLowerCase()} brief and TAKATAK will assign a vetted freelancer within 24 hours.
            </p>
            <Link
              to="/marketplace/post-project"
              className="mt-4 inline-block px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90"
            >
              Post a custom project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => <PackageResultCard key={p.id} pkg={p} />)}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">Can't find exactly what you need?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Post a {category.name} brief and we'll match you with a vetted freelancer in 24h.</p>
        </div>
        <Link
          to="/marketplace/post-project"
          className="px-5 py-2.5 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 shrink-0"
        >
          Post a project
        </Link>
      </section>
    </div>
  );
}