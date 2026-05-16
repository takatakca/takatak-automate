import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/mobile-apps")({
  head: () => ({
    meta: [
      { title: "Mobile apps — TAKATAK" },
      { name: "description", content: "Mobile app projects, builds, and store status." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Mobile apps</h1>
      <p className="text-muted-foreground mt-1">Mobile app projects, builds, and store status.</p>
      <div className="mt-8">
        <EmptyState title="Nothing here yet" description="Once your services are active, real data from the TAKATAK backend will appear here." />
      </div>
    </DashboardShell>
  );
}
