import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCategory } from "@/lib/marketplaceCategories";
import { PopularServicesGrid } from "@/components/marketplace/PopularServicesGrid";
import { ShieldCheck, Clock, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/marketplace/category/$slug")({
  loader: ({ params }) => {
    const cat = getCategory(params.slug);
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

      <section>
        <h2 className="text-xl font-bold text-foreground mb-4">Featured services</h2>
        <PopularServicesGrid />
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