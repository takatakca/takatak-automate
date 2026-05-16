import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/social-media")({
  head: () => ({
    meta: [
      { title: "Social media — TAKATAK" },
      { name: "description", content: "Scheduled posts, connected accounts, and analytics." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Social media</h1>
      <p className="text-muted-foreground mt-1">Scheduled posts, connected accounts, and analytics.</p>
      <div className="mt-8">
        <EmptyState title="Nothing here yet" description="Once your services are active, real data from the TAKATAK backend will appear here." />
      </div>
    </DashboardShell>
  );
}
