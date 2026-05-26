import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/freelancer/")({
  head: () => ({ meta: [{ title: "Freelancer — TAKATAK" }] }),
  component: () => (
    <EmptyState
      title="Welcome to Groupe TAKATAK"
      description="Apply to join the TAKATAK freelancer network. Once approved, you'll see assigned contracts here."
      cta={<Link to="/dashboard/freelancer/contracts" className="px-4 py-2 rounded-md text-sm font-medium text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>View contracts</Link>}
    />
  ),
});