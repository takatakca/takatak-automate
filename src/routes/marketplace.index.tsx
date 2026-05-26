import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero";
import { MarketplaceCategoryStrip } from "@/components/marketplace/MarketplaceCategoryStrip";
import { MarketplaceCategoryGrid } from "@/components/marketplace/MarketplaceCategoryGrid";
import { PopularServicesGrid } from "@/components/marketplace/PopularServicesGrid";
import { ServiceAdvisor } from "@/components/marketplace/ServiceAdvisor";
import { ShieldCheck, Sparkles, Users, ArrowRight } from "lucide-react";

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
      <MarketplaceCategoryStrip />
      <MarketplaceHero />
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-16">
        <section>
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Popular professional services</h2>
              <p className="mt-1 text-sm text-muted-foreground">Handpicked for businesses launching online with TAKATAK.</p>
            </div>
            <Link to="/marketplace/post-project" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              Post a custom project <ArrowRight size={14} />
            </Link>
          </div>
          <PopularServicesGrid />
        </section>

        <section>
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Browse all categories</h2>
          </div>
          <MarketplaceCategoryGrid />
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-[var(--shadow-card)]">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: ShieldCheck, t: "Escrowed payments", d: "Funds released only when you approve delivery." },
              { icon: Users, t: "Vetted freelancers", d: "Every TAKATAK freelancer is screened before joining." },
              { icon: Sparkles, t: "AI-matched briefs", d: "Describe your need — get the right package instantly." },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.t} className="flex gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{b.t}</div>
                    <div className="text-sm text-muted-foreground">{b.d}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <ServiceAdvisor />
        </section>
      </div>
    </>
  );
}