import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

export const Route = createFileRoute("/marketplace/gigs/$id")({
  head: () => ({ meta: [{ title: "Package — TAKATAK Marketplace" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link to="/marketplace" className="text-xs text-muted-foreground hover:text-foreground">← Marketplace</Link>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-64 rounded-2xl" style={{ backgroundImage: "var(--gradient-hero)", opacity: 0.7 }} />
          <h1 className="text-3xl font-bold">Package #{id}</h1>
          <p className="text-sm text-muted-foreground">
            Package details will load from the TAKATAK backend. While we're onboarding freelancers, you can post a custom project and TAKATAK will assign vetted talent.
          </p>
          <div className="flex items-center gap-1 text-sm">
            <Star size={14} className="fill-warning text-warning" /> New listing
          </div>
        </div>
        <aside className="rounded-2xl border border-border bg-card p-6 h-fit">
          <div className="text-xs text-muted-foreground">Starting at</div>
          <div className="mt-1 text-3xl font-bold">$—</div>
          <Link to="/marketplace/post-project" className="mt-4 block text-center px-4 py-2 rounded-md text-sm font-medium text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>
            Request this package
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Payment is held by TAKATAK and released after you approve the delivery.
          </p>
        </aside>
      </div>
    </div>
  );
}