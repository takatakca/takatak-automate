import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCategory } from "@/lib/marketplaceCategories";
import { ServiceAdvisor } from "@/components/marketplace/ServiceAdvisor";

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
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <header>
        <Link to="/marketplace" className="text-xs text-muted-foreground hover:text-foreground">← Marketplace</Link>
        <h1 className="mt-2 text-3xl font-bold">{category.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Vetted TAKATAK freelancers · escrowed payments · one point of accountability.</p>
      </header>
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
        <h3 className="font-semibold">Packages coming soon</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          We're onboarding freelancers for this category. Post a project and TAKATAK will assign the best match.
        </p>
        <Link to="/marketplace/post-project" className="mt-4 inline-block px-4 py-2 rounded-md text-sm font-medium text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>
          Post a {category.name} project
        </Link>
      </div>
      <ServiceAdvisor defaultQuery={category.name} />
    </div>
  );
}