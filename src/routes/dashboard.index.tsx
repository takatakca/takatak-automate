import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ServiceStateBadge } from "@/components/automation/ServiceStateBadge";
import { services } from "@/lib/services";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TAKATAK" },
      { name: "description", content: "Manage your TAKATAK services, automations, and projects." },
    ],
  }),
  component: DashboardOverview,
});

function DashboardOverview() {
  const { user } = useAuth();
  return (
    <DashboardShell>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground mt-1">
            {user?.email ? `Signed in as ${user.email}` : "Welcome back."}
          </p>
        </div>
        <Link
          to="/checkout"
          className="px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          Add a service
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.key} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">{s.title}</h3>
              <ServiceStateBadge state="draft" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.shortDescription}</p>
            <Link
              to={s.dashboardRoute}
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary"
            >
              {s.dashboardCtaLabel} <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
