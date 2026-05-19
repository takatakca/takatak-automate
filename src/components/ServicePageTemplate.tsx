import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { AutomationTimeline } from "@/components/automation/AutomationTimeline";
import { LaunchExternalServiceButton } from "@/components/LaunchExternalServiceButton";
import { StartServiceButton } from "@/components/StartServiceButton";
import type { ServiceDefinition } from "@/lib/services";

export function ServicePageTemplate({ service }: { service: ServiceDefinition }) {
  return (
    <SiteShell>
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-border bg-secondary/40">
            <Sparkles size={12} className="text-accent" /> {service.status === "live" ? "Live service" : "Beta"}
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl font-bold">{service.title}</h1>
          <p className="mt-4 text-muted-foreground text-lg">{service.longDescription}</p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            {service.integrationType === "upmind" ? (
              <Link
                to={service.publicRoute}
                className="px-6 py-3 rounded-lg font-semibold text-primary-foreground inline-flex items-center gap-2"
                style={{ backgroundImage: "var(--gradient-hero)" }}
              >
                {service.ctaLabel} <ArrowRight size={16} />
              </Link>
            ) : (
              <StartServiceButton
                serviceKey={service.key}
                label={service.ctaLabel}
                fallbackTo={service.dashboardRoute}
              />
            )}
            {service.integrationType === "external_portal" && (
              <LaunchExternalServiceButton
                serviceKey={service.launchKey ?? service.key}
                envKey={service.portalEnvKey}
                label="Launch portal"
              />
            )}
          </div>
        </div>
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">How it works</h2>
            <div className="mt-4">
              <AutomationTimeline current="paid" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">What you get</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• Automated provisioning where supported</li>
              <li>• AI-assisted intake and brief generation</li>
              <li>• Live status in your TAKATAK dashboard</li>
              <li>• TAKATAK team support for exceptions</li>
              <li>• Single billing across every service</li>
            </ul>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-1 text-sm text-primary"
            >
              Open dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}