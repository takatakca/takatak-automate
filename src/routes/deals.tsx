import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { Tag } from "lucide-react";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Today's Deals — TAKATAK" },
      { name: "description", content: "Limited-time bundles and discounts across TAKATAK services." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteShell>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center">
          <Tag className="mx-auto text-accent" />
          <h1 className="mt-4 text-4xl font-bold">Today's Deals</h1>
          <p className="mt-3 text-muted-foreground">Curated bundles across domains, hosting, websites and marketing.</p>
        </div>
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
          <h3 className="text-lg font-semibold">No active promotions right now</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            TAKATAK runs seasonal deals on hosting, domains and marketplace bundles. Subscribe from your dashboard to be notified.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/services/websites" className="px-4 py-2 rounded-md border border-border text-sm hover:bg-secondary/50">Browse services</Link>
            <Link to="/marketplace" className="px-4 py-2 rounded-md text-sm font-medium text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>Visit marketplace</Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}