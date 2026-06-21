import { createFileRoute, Link } from "@tanstack/react-router";
import { Server, Shield, Repeat, Rocket } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { UpmindDomainSearch } from "@/components/upmind/UpmindDomainSearch";
import { UpmindHostingPlans } from "@/components/upmind/UpmindHostingPlans";

const features = [
  { icon: Rocket, title: "One-click WordPress", desc: "Launch in seconds with guided setup." },
  { icon: Shield, title: "AI security", desc: "24/7 monitoring and hardening." },
  { icon: Repeat, title: "Automatic backups", desc: "Offsite, browseable, one-click restore." },
  { icon: Server, title: "Free migrations", desc: "We move your site with zero downtime." },
];

export const Route = createFileRoute("/hosting")({
  head: () => ({ meta: [{ title: "Web Hosting — TAKATAK" }] }),
  component: HostingPage,
});

function HostingPage() {
  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold">Managed hosting that just works</h1>
          <p className="mt-4 text-muted-foreground">Litespeed-powered hosting with free migrations, daily backups, and 24/7 expert support.</p>
          <Link to="/checkout" className="inline-block mt-8 px-6 py-3 rounded-lg font-semibold text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>
            Continue to checkout
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
              <f.icon className="text-primary" size={22} />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-16">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Pick a plan and supercharge your WordPress</h2>
            <p className="mt-2 text-sm text-muted-foreground">Live pricing in CAD via Upmind. Bundle a domain at checkout.</p>
          </div>
          <UpmindHostingPlans />
        </div>
        <div className="mt-16 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">Search a domain to bundle</h2>
          <UpmindDomainSearch />
        </div>
      </section>
    </SiteShell>
  );
}