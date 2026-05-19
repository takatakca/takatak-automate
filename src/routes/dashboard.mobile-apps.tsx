import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/mobile-apps")({
  head: () => ({
    meta: [
      { title: "Mobile apps — TAKATAK" },
      { name: "description", content: "iOS and Android app projects in motion." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Mobile apps</h1>
      <p className="text-muted-foreground mt-1">iOS and Android app projects in motion.</p>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["mobile_apps"]} emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
