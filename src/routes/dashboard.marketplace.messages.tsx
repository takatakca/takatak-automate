import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/marketplace/messages")({
  head: () => ({ meta: [{ title: "Messages — TAKATAK" }] }),
  component: () => (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Messages</h1>
      <p className="text-muted-foreground mt-1">Conversations across your marketplace projects.</p>
      <div className="mt-8">
        <EmptyState title="No messages" description="Open a project to message TAKATAK and your assigned freelancer." />
      </div>
    </DashboardShell>
  ),
});