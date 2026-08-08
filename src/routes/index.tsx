import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { brand } from "@/lib/brand";
import { PromoMarquee } from "@/components/promotions/PromoMarquee";
import { TakatakEcosystemHero } from "@/components/home/TakatakEcosystemHero";
import { TrendingProjectsRail } from "@/components/home/TrendingProjectsRail";
import { DiscoverySection } from "@/components/home/DiscoverySection";
import { PopularBusinessUpgrades } from "@/components/home/PopularBusinessUpgrades";
import { DomainHostingSpotlight } from "@/components/home/DomainHostingSpotlight";
import { PricingGateways } from "@/components/home/PricingGateways";
import { BusinessTransformationSlider } from "@/components/home/BusinessTransformationSlider";
import { ManagedDeliveryJourney } from "@/components/home/ManagedDeliveryJourney";
import { ConciergeSupportSection } from "@/components/home/ConciergeSupportSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TAKATAK — Business services marketplace: websites, domains, hosting & growth" },
      { name: "description", content: brand.tagline },
      { property: "og:title", content: "TAKATAK — Business services marketplace" },
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
      <TakatakEcosystemHero />
      <PromoMarquee />
      <TrendingProjectsRail />
      <DiscoverySection />
      <BusinessTransformationSlider />
      <PopularBusinessUpgrades />
      <DomainHostingSpotlight />
      <PricingGateways />
      <ManagedDeliveryJourney />
      <ConciergeSupportSection />
      <FinalCtaSection />
    </SiteShell>
  );
}
