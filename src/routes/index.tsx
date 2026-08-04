import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { brand } from "@/lib/brand";
import { PromoMarquee } from "@/components/promotions/PromoMarquee";
import { PremiumHero } from "@/components/home/PremiumHero";
import { DiscoverySection } from "@/components/home/DiscoverySection";
import { PopularUpgradesSection } from "@/components/home/PopularUpgradesSection";
import { DomainHostingSpotlight } from "@/components/home/DomainHostingSpotlight";
import { PricingGateways } from "@/components/home/PricingGateways";
import { ServiceShowcaseSlider } from "@/components/home/ServiceShowcaseSlider";
import { JourneySection } from "@/components/home/JourneySection";
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
      <PremiumHero />
      <PromoMarquee />
      <DiscoverySection />
      <ServiceShowcaseSlider />
      <PricingGateways />
      <PopularUpgradesSection />
      <DomainHostingSpotlight />
      <JourneySection />
      <ConciergeSupportSection />
      <FinalCtaSection />
    </SiteShell>
  );
}
