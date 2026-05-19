import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/domains")({
  head: () => ({
    meta: [
      { title: "Domains — TAKATAK" },
      { name: "description", content: "Your registered domains and DNS." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Domains</h1>
      <p className="text-muted-foreground mt-1">Your registered domains and DNS.</p>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["domains"]} emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
