import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/freelancer/contracts/")({
  head: () => ({ meta: [{ title: "Contracts — TAKATAK" }] }),
  component: () => (
    <EmptyState
      title="No contracts assigned yet"
      description="TAKATAK only shows contracts that have been assigned to you. New assignments will appear here automatically."
    />
  ),
});