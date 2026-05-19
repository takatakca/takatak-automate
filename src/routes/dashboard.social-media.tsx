import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/social-media")({
  head: () => ({
    meta: [
      { title: "Social media — TAKATAK" },
      { name: "description", content: "Connected accounts and scheduled content." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Social media</h1>
      <p className="text-muted-foreground mt-1">Connected accounts and scheduled content.</p>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["social_media"]} emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
