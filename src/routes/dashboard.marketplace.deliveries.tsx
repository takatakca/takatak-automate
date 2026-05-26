import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/marketplace/deliveries")({
  head: () => ({ meta: [{ title: "Deliveries — TAKATAK" }] }),
  component: () => (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Deliveries</h1>
      <p className="text-muted-foreground mt-1">Files and final outputs submitted on your projects.</p>
      <div className="mt-8">
        <EmptyState title="No deliveries yet" description="Once your freelancer submits work, you'll review, approve or request revisions here." />
      </div>
    </DashboardShell>
  ),
});