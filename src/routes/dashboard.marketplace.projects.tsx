import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/marketplace/projects")({
  head: () => ({ meta: [{ title: "My projects — TAKATAK" }] }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">My projects</h1>
      <p className="text-muted-foreground mt-1">Projects you've posted on the TAKATAK marketplace.</p>
      <div className="mt-8">
        <EmptyState
          title="No projects yet"
          description="Post your first project and TAKATAK will assign a vetted freelancer. Payment is held in escrow until you approve the delivery."
          cta={<Link to="/marketplace/post-project" className="px-4 py-2 rounded-md text-sm font-medium text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>Post a project</Link>}
        />
      </div>
    </DashboardShell>
  );
}