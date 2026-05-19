import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";

export const Route = createFileRoute("/dashboard/local-listings")({
  head: () => ({
    meta: [
      { title: "Local listings — TAKATAK" },
      { name: "description", content: "Listings synced across Google, Apple, Bing, and 50+ directories." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Local listings</h1>
      <p className="text-muted-foreground mt-1">Listings synced across Google, Apple, Bing, and 50+ directories.</p>
      <div className="mt-8">
        <UserServicesPanel serviceKeys={["local_listings"]} emptyCta={{ to: "/checkout", label: "Add a service" }} />
      </div>
    </DashboardShell>
  );
}
