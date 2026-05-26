import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/marketplace")({
  component: () => (
    <SiteShell>
      <Outlet />
    </SiteShell>
  ),
});