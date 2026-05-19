import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/websites")({
  head: () => ({
    meta: [
      { title: "Websites — TAKATAK" },
      { name: "description", content: "AI-assisted website projects and build status." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Websites</h1>
      <p className="text-muted-foreground mt-1">AI-assisted website projects and build status.</p>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["websites"]} emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
