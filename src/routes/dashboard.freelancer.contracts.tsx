import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/freelancer/contracts")({
  component: () => <Outlet />,
});

// Helper not used — keeping import minimal.
void useMatches;