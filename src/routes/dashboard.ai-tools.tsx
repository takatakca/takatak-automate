import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/ai-tools")({
  head: () => ({
    meta: [
      { title: "AI tools — TAKATAK" },
      { name: "description", content: "Custom AI workflows TAKATAK runs for your business." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">AI tools</h1>
      <p className="text-muted-foreground mt-1">Custom AI workflows TAKATAK runs for your business.</p>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["ai_business_tools"]} emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
