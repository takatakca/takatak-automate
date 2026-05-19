import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/voip")({
  head: () => ({
    meta: [
      { title: "VoIP — TAKATAK" },
      { name: "description", content: "Cloud business phone numbers and call routing." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">VoIP</h1>
      <p className="text-muted-foreground mt-1">Cloud business phone numbers and call routing.</p>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["voip_phone"]} emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
