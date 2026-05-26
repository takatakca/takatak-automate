import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/freelancer/payouts")({
  head: () => ({ meta: [{ title: "Payouts — TAKATAK" }] }),
  component: () => (
    <EmptyState
      title="No payouts yet"
      description="Approved contracts move to payout after the grace period. Released payouts will be listed here."
    />
  ),
});