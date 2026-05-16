import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/hosting")({
  head: () => ({
    meta: [
      { title: "Hosting — TAKATAK" },
      { name: "description", content: "Your hosting plans, sites, and resource usage (Upmind)." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Hosting</h1>
      <p className="text-muted-foreground mt-1">Your hosting plans, sites, and resource usage (Upmind).</p>
      <div className="mt-8">
        <EmptyState title="Nothing here yet" description="Once your services are active, real data from the TAKATAK backend will appear here." />
      </div>
    </DashboardShell>
  );
}
