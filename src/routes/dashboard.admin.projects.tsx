import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PaymentReleaseStatus } from "@/components/marketplace/PaymentReleaseStatus";
import { listAdminProjects, adminSweepPayouts, type AdminProjectFilter } from "@/lib/admin";

const FILTERS: { id: AdminProjectFilter; label: string }[] = [
  { id: "awaiting_assignment", label: "Awaiting assignment" },
  { id: "assigned", label: "Assigned" },
  { id: "submitted", label: "Submitted" },
  { id: "grace_period", label: "Grace period" },
  { id: "disputed", label: "Disputed" },
  { id: "release_ready", label: "Released" },
  { id: "all", label: "All" },
];

export const Route = createFileRoute("/dashboard/admin/projects")({
  head: () => ({
    meta: [
      { title: "Admin · Projects — TAKATAK" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Page,
});

function Page() {
  const [filter, setFilter] = useState<AdminProjectFilter>("awaiting_assignment");
  const q = useQuery({
    queryKey: ["admin", "projects", filter],
    queryFn: () => listAdminProjects(filter),
    retry: false,
  });
  const projects = q.data?.projects ?? [];

  return (
    <DashboardShell>
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Admin · Marketplace projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assign paid projects to Groupe TAKATAK freelancers, review deliveries and release payouts.
          </p>
        </div>
        <button
          onClick={() => adminSweepPayouts().then(() => q.refetch())}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold border border-border hover:bg-secondary"
        >
          Run payout sweep
        </button>
      </header>

      <div className="mt-5 flex flex-wrap gap-1 border-b border-border">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${
              filter === f.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        {q.isLoading && <div className="p-6 text-sm text-muted-foreground">Loading projects…</div>}
        {q.isError && <div className="p-6 text-sm text-muted-foreground">Admin endpoint not reachable. Sign in with an admin account.</div>}
        {!q.isLoading && !q.isError && projects.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No projects in this bucket.</div>
        )}
        {projects.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Project</th>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Payment</th>
                <th className="text-left px-4 py-2">Contract</th>
                <th className="text-left px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.id}</div>
                  </td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3"><PaymentReleaseStatus state={p.paymentState} /></td>
                  <td className="px-4 py-3 text-xs">
                    {p.contracts[0] ? `→ ${p.contracts[0].freelancerId} · ${p.contracts[0].status}` : <span className="text-muted-foreground">none</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/dashboard/admin/projects/$id"
                      params={{ id: p.id }}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardShell>
  );
}