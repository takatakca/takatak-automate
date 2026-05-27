import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProjectWorkspace } from "@/components/marketplace/ProjectWorkspace";
import { ShieldCheck, LifeBuoy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProject, type ClientProject } from "@/lib/marketplace";

export const Route = createFileRoute("/dashboard/projects/$projectId")({
  head: () => ({ meta: [{ title: "Project workspace — TAKATAK" }] }),
  component: Page,
});

function Page() {
  const { projectId } = Route.useParams();
  const q = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    retry: false,
  });

  const fallback: ClientProject = {
    id: projectId,
    userId: "",
    title: `Project ${projectId}`,
    brief:
      "We couldn't load this project right now. Anything you submitted is safe — TAKATAK keeps a copy and will surface it here once the backend is reachable.",
    category: "website_design",
    status: "submitted",
    paymentState: "unpaid",
    createdAt: new Date().toISOString(),
  };

  const project = q.data?.project ?? fallback;
  const messages = q.data?.messages ?? [];
  const files = q.data?.files ?? [];
  const milestones = q.data?.milestones ?? [];
  const deliveries = q.data?.deliveries ?? [];

  return (
    <DashboardShell>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to="/dashboard/marketplace" className="text-xs text-muted-foreground hover:text-foreground">← Back to marketplace</Link>
          <h1 className="mt-2 text-2xl font-bold">Project workspace</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Everything about this project in one place. TAKATAK manages the freelancer — you review the work, request revisions, or approve to release payment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/support"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold border border-border hover:bg-secondary"
          >
            <LifeBuoy size={14} /> Contact TAKATAK support
          </Link>
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary">
        <ShieldCheck size={13} /> Payment is held in escrow. It releases once you approve the delivery or the grace period ends.
      </div>

      <div className="mt-6">
        <ProjectWorkspace
          project={project}
          messages={messages}
          files={files}
          milestones={milestones}
          deliveries={deliveries}
        />
      </div>

      {q.isError && (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Live project data isn't loading right now. Your submission is safe — TAKATAK will pick it up as soon as the backend is reachable.
        </div>
      )}
    </DashboardShell>
  );
}
