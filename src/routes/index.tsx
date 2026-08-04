import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { brand } from "@/lib/brand";
import { PromoMarquee } from "@/components/promotions/PromoMarquee";
import { PremiumHero } from "@/components/home/PremiumHero";
import { MarketplaceCategoryRail } from "@/components/home/MarketplaceCategoryRail";
import { PopularProjectsSection } from "@/components/home/PopularProjectsSection";
import { ServicesGridSection } from "@/components/home/ServicesGridSection";
import { DomainHostingSpotlight } from "@/components/home/DomainHostingSpotlight";
import { PricingHighlights } from "@/components/home/PricingHighlights";
import { ServiceShowcaseSlider } from "@/components/home/ServiceShowcaseSlider";
import { PremiumProcessSection } from "@/components/home/PremiumProcessSection";
import { WhyTakatakSection } from "@/components/home/WhyTakatakSection";
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
      <MarketplaceCategoryRail />
      <ServiceShowcaseSlider />
      <PopularProjectsSection />
      <ServicesGridSection />
      <DomainHostingSpotlight />
      <PricingHighlights />
      <PremiumProcessSection />
      <WhyTakatakSection />
      <FinalCtaSection />
    </SiteShell>
  );
}
