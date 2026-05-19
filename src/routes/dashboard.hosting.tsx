import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/hosting")({
  head: () => ({
    meta: [
      { title: "Hosting — TAKATAK" },
      { name: "description", content: "Web hosting accounts and status." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Hosting</h1>
      <p className="text-muted-foreground mt-1">Web hosting accounts and status.</p>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["hosting"]} emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
