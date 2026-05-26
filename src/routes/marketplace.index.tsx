import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero";
import { MarketplaceCategoryGrid } from "@/components/marketplace/MarketplaceCategoryGrid";
import { ServiceAdvisor } from "@/components/marketplace/ServiceAdvisor";

export const Route = createFileRoute("/marketplace/")({
  head: () => ({
    meta: [
      { title: "TAKATAK Marketplace — Hire vetted talent" },
      { name: "description", content: "Logos, websites, content, automation and more. Delivered through TAKATAK with escrowed payments." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <MarketplaceHero />
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-2xl font-bold">Browse categories</h2>
            <Link to="/marketplace/post-project" className="text-sm text-primary hover:underline">Need custom work? Post a project →</Link>
          </div>
          <MarketplaceCategoryGrid />
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">Not sure what you need?</h2>
          <ServiceAdvisor />
        </section>
      </div>
    </>
  );
}