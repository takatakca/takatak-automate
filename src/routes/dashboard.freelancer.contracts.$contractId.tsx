import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/freelancer/contracts/$contractId")({
  head: () => ({ meta: [{ title: "Contract — TAKATAK" }] }),
  component: Page,
});

function Page() {
  const { contractId } = Route.useParams();
  return (
    <EmptyState
      title={`Contract ${contractId}`}
      description="Contract details, brief, files, deliveries and payment release status will appear here once the backend is connected."
    />
  );
}