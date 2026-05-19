import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing — TAKATAK" },
      { name: "description", content: "AI-planned campaigns across paid and organic." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Marketing</h1>
      <p className="text-muted-foreground mt-1">AI-planned campaigns across paid and organic.</p>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["online_marketing"]} emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
