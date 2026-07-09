import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { brand } from "@/lib/brand";
void brand;
import { PopularServicesGrid } from "@/components/marketplace/PopularServicesGrid";
import { FeaturedServicesStrip } from "@/components/marketplace/FeaturedServicesStrip";
import { TrustBlock } from "@/components/marketplace/TrustBlock";
import { PromoMarquee } from "@/components/promotions/PromoMarquee";
import { UpmindDomainSearch } from "@/components/upmind/UpmindDomainSearch";
import { PremiumProcessSection } from "@/components/home/PremiumProcessSection";
import { BusinessEcosystemSection } from "@/components/home/BusinessEcosystemSection";
import { PremiumHero } from "@/components/home/PremiumHero";
import { FeaturedPricingSection } from "@/components/home/FeaturedPricingSection";
import { HostingSpotlight } from "@/components/home/HostingSpotlight";
import { WhyTakatakSection } from "@/components/home/WhyTakatakSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TAKATAK — Launch, host, market, and automate your business" },
      { name: "description", content: brand.tagline },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <PremiumHero />

      <PromoMarquee />

      <BusinessEcosystemSection />

      <FeaturedPricingSection />

      <HostingSpotlight />

      {/* Domain search — same Upmind DAC widget as /domain */}
      <section className="max-w-5xl mx-auto px-4 pt-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Find your perfect domain
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Instant availability search, registration, and DNS — fully managed through TAKATAK. From $19.99/year in CAD.
          </p>
        </div>
        <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <UpmindDomainSearch />
        </div>
      </section>

      {/* Popular services */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Popular services</h2>
            <p className="mt-1 text-sm text-muted-foreground">Hand-picked services from vetted TAKATAK freelancers.</p>
          </div>
          <Link to="/marketplace" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <PopularServicesGrid />
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <FeaturedServicesStrip />
      </section>

      <PremiumProcessSection />

      <WhyTakatakSection />

      <div className="max-w-7xl mx-auto px-4 py-16 pb-24 md:pb-28">
        <TrustBlock />
      </div>

      <FinalCtaSection />
    </SiteShell>
  );
}
