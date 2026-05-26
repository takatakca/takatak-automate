import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";

const tabs: { to: string; label: string; exact?: boolean }[] = [
  { to: "/dashboard/freelancer", label: "Overview", exact: true },
  { to: "/dashboard/freelancer/contracts", label: "Contracts" },
  { to: "/dashboard/freelancer/deliveries", label: "Deliveries" },
  { to: "/dashboard/freelancer/payouts", label: "Payouts" },
];

export const Route = createFileRoute("/dashboard/freelancer")({
  component: Layout,
});

function Layout() {
  const loc = useLocation();
  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl font-bold">Groupe TAKATAK — Freelancer</h1>
        <p className="text-muted-foreground mt-1">Your assigned contracts, deliveries and payouts.</p>
      </header>
      <nav className="mt-6 flex gap-1 border-b border-border">
        {tabs.map((t) => {
          const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
          return (
            <Link key={t.to} to={t.to as never} className={`px-3 py-2 text-sm border-b-2 -mb-px ${active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6"><Outlet /></div>
    </DashboardShell>
  );
}