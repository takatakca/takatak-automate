import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero";
import { MarketplaceCategoryGrid } from "@/components/marketplace/MarketplaceCategoryGrid";
import { PopularServicesGrid } from "@/components/marketplace/PopularServicesGrid";
import { HowItWorks } from "@/components/marketplace/HowItWorks";
import { WorkflowsBlock } from "@/components/marketplace/WorkflowsBlock";
import { TrustBlock } from "@/components/marketplace/TrustBlock";
import { ArrowRight } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-16">
        <section>
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Popular services</h2>
              <p className="mt-1 text-sm text-muted-foreground">Hand-picked services from vetted TAKATAK freelancers.</p>
            </div>
            <Link to="/marketplace/post-project" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              Post a custom project <ArrowRight size={14} />
            </Link>
          </div>
          <PopularServicesGrid />
        </section>

        <HowItWorks />

        <section>
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Explore by category</h2>
          </div>
          <MarketplaceCategoryGrid />
        </section>

        <WorkflowsBlock />

        <TrustBlock />
      </div>
    </>
  );
}