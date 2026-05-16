import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/websites")({
  head: () => ({
    meta: [
      { title: "Websites — TAKATAK" },
      { name: "description", content: "AI-assisted website projects and build status." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Websites</h1>
      <p className="text-muted-foreground mt-1">AI-assisted website projects and build status.</p>
      <div className="mt-8">
        <EmptyState title="Nothing here yet" description="Once your services are active, real data from the TAKATAK backend will appear here." />
      </div>
    </DashboardShell>
  );
}
