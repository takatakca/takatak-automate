import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — TAKATAK" },
      { name: "description", content: "Your marketplace projects, gigs, and freelancer engagements." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Marketplace</h1>
      <p className="text-muted-foreground mt-1">Your marketplace projects, gigs, and freelancer engagements.</p>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["freelancer_marketplace"]} emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
