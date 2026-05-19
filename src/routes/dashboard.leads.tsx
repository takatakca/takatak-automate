import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/leads")({
  head: () => ({
    meta: [
      { title: "Leads — TAKATAK" },
      { name: "description", content: "Qualified leads sourced by TAKATAK AI." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Leads</h1>
      <p className="text-muted-foreground mt-1">Qualified leads sourced by TAKATAK AI.</p>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["lead_generation"]} emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
