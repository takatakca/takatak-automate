import { createFileRoute, Link } from "@tanstack/react-router";
import { Server, Shield, Repeat, Rocket } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { UpmindDomainSearch } from "@/components/upmind/UpmindDomainSearch";
import { UpmindHostingPlans } from "@/components/upmind/UpmindHostingPlans";
import { useLanguage } from "@/hooks/useLanguage";

const features = [
  { icon: Rocket, title: "hostingPage.f1", desc: "hostingPage.f1d" },
  { icon: Shield, title: "hostingPage.f2", desc: "hostingPage.f2d" },
  { icon: Repeat, title: "hostingPage.f3", desc: "hostingPage.f3d" },
  { icon: Server, title: "hostingPage.f4", desc: "hostingPage.f4d" },
] as const;

export const Route = createFileRoute("/hosting")({
  head: () => ({ meta: [{ title: "Web Hosting — TAKATAK" }] }),
  component: HostingPage,
});

function HostingPage() {
  const { t } = useLanguage();
  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold">{t("hostingPage.title")}</h1>
          <p className="mt-4 text-muted-foreground">{t("hostingPage.body")}</p>
          <Link to="/checkout" className="inline-block mt-8 px-6 py-3 rounded-lg font-semibold text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>
            {t("hostingPage.cta")}
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
              <f.icon className="text-primary" size={22} />
              <h3 className="mt-3 font-semibold">{t(f.title)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(f.desc)}</p>
            </div>
          ))}
        </div>
        <div className="mt-16">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">{t("hostingPage.plansTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("hostingPage.plansBody")}</p>
          </div>
          <UpmindHostingPlans />
        </div>
        <div className="mt-16 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">{t("hostingPage.domainTitle")}</h2>
          <UpmindDomainSearch />
        </div>
      </section>
    </SiteShell>
  );
}