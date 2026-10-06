import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { brand } from "@/lib/brand";
import { PromoMarquee } from "@/components/promotions/PromoMarquee";
import { TakatakEcosystemHero } from "@/components/home/TakatakEcosystemHero";
import { TrendingProjectsRail } from "@/components/home/TrendingProjectsRail";
import { FoundationWorkspace } from "@/components/home/foundation/FoundationWorkspace";
import { BusinessTransformationStage } from "@/components/home/BusinessTransformationStage";
import { EcosystemShowcase } from "@/components/home/EcosystemShowcase";
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
    <SiteShell flushFooter>
      {/* 1. What TAKATAK is + start a request */}
      <TakatakEcosystemHero />
      <PromoMarquee />
      {/* 2. What businesses buy first (real catalogue packages) */}
      <TrendingProjectsRail />
      {/* 3. How it fits together: Launch → Grow → Operate */}
      <BusinessTransformationStage />
      {/* 4. Domain + hosting picker */}
      <FoundationWorkspace />
      {/* 5. The products behind the platform */}
      <EcosystemShowcase />
      {/* 6. How delivery works, then help choosing */}
      <ManagedDeliveryJourney />
      <ConciergeSupportSection />
      <FinalCtaSection />
    </SiteShell>
  );
}
