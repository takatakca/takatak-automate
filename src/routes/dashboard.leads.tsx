import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/leads")({
  head: () => ({
    meta: [
      { title: "Lead generation (FLEXS) — TAKATAK" },
      { name: "description", content: "Qualified leads delivered to your TAKATAK dashboard." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Lead generation (FLEXS)</h1>
      <p className="text-muted-foreground mt-1">Qualified leads delivered to your TAKATAK dashboard.</p>
      <div className="mt-8">
        <EmptyState title="Nothing here yet" description="Once your services are active, real data from the TAKATAK backend will appear here." />
      </div>
    </DashboardShell>
  );
}
