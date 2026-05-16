import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/local-listings")({
  head: () => ({
    meta: [
      { title: "Local listings (QMAPS) — TAKATAK" },
      { name: "description", content: "Local Listing Visibility powered by QMAPS." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Local listings (QMAPS)</h1>
      <p className="text-muted-foreground mt-1">Local Listing Visibility powered by QMAPS.</p>
      <div className="mt-8">
        <EmptyState title="Nothing here yet" description="Once your services are active, real data from the TAKATAK backend will appear here." />
      </div>
    </DashboardShell>
  );
}
