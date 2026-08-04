import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { brand } from "@/lib/brand";
import { PromoMarquee } from "@/components/promotions/PromoMarquee";
import { PremiumHero } from "@/components/home/PremiumHero";
import { ServicePathways } from "@/components/home/ServicePathways";
import { TrustBlock } from "@/components/marketplace/TrustBlock";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TAKATAK — Everything your business needs to run online" },
      { name: "description", content: brand.tagline },
      { property: "og:title", content: "TAKATAK — Everything your business needs to run online" },
      { property: "og:description", content: brand.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <PremiumHero />

      <PromoMarquee />

      <ServicePathways />

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">Not sure what you need?</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Describe your business and a TAKATAK specialist scopes the work for you.
          </p>
          <Link
            to="/marketplace/post-project"
            className="mt-5 inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            Start a project
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16">
        <TrustBlock />
      </div>

      <FinalCtaSection />
    </SiteShell>
  );
}
