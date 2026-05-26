import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/marketplace/")({
  head: () => ({
    meta: [{ title: "Marketplace — TAKATAK" }],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Marketplace</h1>
      <p className="text-muted-foreground mt-1">Your marketplace projects, gigs, and freelancer engagements.</p>
      <div className="mt-6 flex gap-2 flex-wrap">
        <Link to="/dashboard/marketplace/projects" className="px-3 py-2 rounded-md border border-border text-sm hover:bg-secondary/50">Projects</Link>
        <Link to="/dashboard/marketplace/messages" className="px-3 py-2 rounded-md border border-border text-sm hover:bg-secondary/50">Messages</Link>
        <Link to="/dashboard/marketplace/deliveries" className="px-3 py-2 rounded-md border border-border text-sm hover:bg-secondary/50">Deliveries</Link>
        <Link to="/marketplace/post-project" className="px-3 py-2 rounded-md text-sm font-medium text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>Post a project</Link>
      </div>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["freelancer_marketplace"]} emptyCta={{ to: "/marketplace", label: "Browse marketplace" }} />
      </div>
    </DashboardShell>
  );
}