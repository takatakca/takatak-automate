import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/marketplace")({
  head: () => ({
    meta: [
      { title: "Service marketplace — TAKATAK" },
      { name: "description", content: "Browse gigs, post projects, and manage deliveries." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Service marketplace</h1>
      <p className="text-muted-foreground mt-1">Browse gigs, post projects, and manage deliveries.</p>
      <div className="mt-8">
        <EmptyState title="Nothing here yet" description="Once your services are active, real data from the TAKATAK backend will appear here." />
      </div>
    </DashboardShell>
  );
}
