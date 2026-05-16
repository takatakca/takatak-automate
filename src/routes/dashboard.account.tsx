import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/account")({
  head: () => ({
    meta: [
      { title: "Account — TAKATAK" },
      { name: "description", content: "Profile, security, and notification settings." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Account</h1>
      <p className="text-muted-foreground mt-1">Profile, security, and notification settings.</p>
      <div className="mt-8">
        <EmptyState title="Nothing here yet" description="Once your services are active, real data from the TAKATAK backend will appear here." />
      </div>
    </DashboardShell>
  );
}
