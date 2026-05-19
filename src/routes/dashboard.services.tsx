import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/services")({
  head: () => ({
    meta: [
      { title: "All services — TAKATAK" },
      { name: "description", content: "Every TAKATAK service connected to your account." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">All services</h1>
      <p className="text-muted-foreground mt-1">Every TAKATAK service connected to your account.</p>
      <div className="mt-8">
        <UserServicesPanel  emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
