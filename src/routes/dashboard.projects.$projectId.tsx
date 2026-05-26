import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";
import { ProjectWorkspace } from "@/components/marketplace/ProjectWorkspace";
import type { ClientProject } from "@/lib/marketplace";

export const Route = createFileRoute("/dashboard/projects/$projectId")({
  head: () => ({ meta: [{ title: "Project workspace — TAKATAK" }] }),
  component: Page,
});

function Page() {
  const { projectId } = Route.useParams();
  // Placeholder shell — real data loads from backend once it returns a project.
  const placeholder: ClientProject = {
    id: projectId,
    userId: "",
    title: `Project ${projectId}`,
    brief: "Your brief will appear here once the project finishes loading from TAKATAK.",
    category: "other",
    status: "submitted",
    paymentState: "paid_to_takatak",
    createdAt: new Date().toISOString(),
  };
  return (
    <DashboardShell>
      <EmptyState
        title="Live project data loading"
        description="When the backend is connected, your messages, files, milestones and deliveries appear below. The workspace shell is rendered so you can preview the layout."
      />
      <div className="mt-8">
        <ProjectWorkspace
          project={placeholder}
          messages={[]}
          files={[]}
          milestones={[]}
          deliveries={[]}
        />
      </div>
    </DashboardShell>
  );
}