import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";
import { apiGet } from "@/lib/api-client";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/exceptions")({
  head: () => ({
    meta: [
      { title: "Admin · Exceptions — TAKATAK" },
      { name: "description", content: "Services needing TAKATAK human review." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Page,
});

/**
 * Hidden admin view backed by GET /admin/exceptions on the Render backend.
 * Not linked in the sidebar — gated behind the feature flag below until the
 * frontend reliably surfaces an `admin` role from the auth token. Until then,
 * non-admin users will simply get a 403 from the backend.
 */
function isAdminFeatureEnabled(): boolean {
  if (typeof window === "undefined") return false;
  // Either an explicit opt-in OR a future auth claim hook can flip this.
  return window.localStorage.getItem("takatak.adminMode") === "1";
}

function Page() {
  const enabled = isAdminFeatureEnabled();
  const q = useQuery({
    queryKey: ["admin", "exceptions"],
    queryFn: () => apiGet<any>("/admin/exceptions"),
    enabled,
    retry: false,
  });
  const data = q.data ?? {};
  const buckets: { title: string; items: any[] }[] = [
    { title: "Services stuck waiting for TAKATAK", items: data.pendingServices ?? [] },
    { title: "Failed automation jobs", items: data.failedJobs ?? [] },
    { title: "Intake awaiting review", items: data.intakeReview ?? [] },
    { title: "Provisioning failures", items: data.provisioningFailures ?? [] },
  ];
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Exceptions</h1>
      <p className="text-muted-foreground mt-1">
        Unpaid stuck orders, deliveries overdue, freelancers not accepting, grace-period payouts blocked on missing provider, failed webhooks, and failed worker jobs.
      </p>
      <div className="mt-8">
        {!enabled ? (
          <EmptyState
            title="Admin only"
            description="This page is gated. Set localStorage 'takatak.adminMode' = '1' in a trusted browser to preview the layout. Backend still enforces admin role server-side."
          />
        ) : q.isError ? (
          <EmptyState title="Backend unavailable" description="Couldn't load /admin/exceptions. Backend may be down or you may lack admin role." />
        ) : (
          <div className="space-y-8">
            {buckets.map((b) => (
              <section key={b.title}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> {b.title} ({b.items.length})
                </h2>
                {b.items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground">Nothing to action.</div>
                ) : (
                  <ul className="space-y-2">
                    {b.items.slice(0, 25).map((x: any, i: number) => (
                      <li key={x.id ?? i} className="rounded-xl border border-border bg-card p-3 text-sm font-mono break-all">
                        {JSON.stringify(x).slice(0, 240)}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
