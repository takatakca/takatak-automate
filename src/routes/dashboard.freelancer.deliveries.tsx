import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/freelancer/deliveries")({
  head: () => ({ meta: [{ title: "Freelancer deliveries — TAKATAK" }] }),
  component: () => (
    <EmptyState
      title="No deliveries submitted yet"
      description="Submit your work from inside a contract. Payment is released after client approval and the grace period."
    />
  ),
});