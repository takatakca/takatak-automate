import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserServicesPanel } from "@/components/dashboard/UserServicesPanel";
import { useAuth } from "@/lib/auth-context";
import { DashboardPromoCard } from "@/components/promotions/DashboardPromoCard";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TAKATAK" },
      { name: "description", content: "Manage your TAKATAK services, automations, and projects." },
    ],
  }),
  component: DashboardOverview,
});

function DashboardOverview() {
  const { user } = useAuth();
  return (
    <DashboardShell>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground mt-1">
            {user?.email ? `Signed in as ${user.email}` : "Welcome back."}
          </p>
        </div>
        <Link
          to="/checkout"
          className="px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          Add a service
        </Link>
      </div>
      <div className="mt-6">
        <DashboardPromoCard />
      </div>
      <div className="mt-8">
        <UserServicesPanel
          emptyTitle="No services yet"
          emptyDescription="Pick a TAKATAK service to get started — provisioning, AI intake, and live status all appear here."
          emptyCta={{ to: "/checkout", label: "Browse services" }}
        />
      </div>
    </DashboardShell>
  );
}
