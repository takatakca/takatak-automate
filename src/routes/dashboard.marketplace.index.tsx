import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ShieldCheck, Briefcase, Inbox, FileCheck2, Save, AlertTriangle, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listProjects, paymentReleaseLabel, type ClientProject } from "@/lib/marketplace";
import { PaymentReleaseStatus } from "@/components/marketplace/PaymentReleaseStatus";

export const Route = createFileRoute("/dashboard/marketplace/")({
  head: () => ({ meta: [{ title: "Marketplace — TAKATAK" }] }),
  component: Page,
});

const ACTIVE = new Set(["paid_to_takatak", "assigned", "accepted_by_freelancer", "in_progress"]);

function Page() {
  const q = useQuery({
    queryKey: ["marketplace-projects"],
    queryFn: () => listProjects(),
    retry: false,
  });
  const projects: ClientProject[] = q.data?.projects ?? [];

  const counts = {
    active: projects.filter((p) => ACTIVE.has(p.paymentState)).length,
    approval: projects.filter((p) => p.paymentState === "submitted").length,
    deliveries: projects.filter((p) => ["submitted", "revision_requested"].includes(p.paymentState)).length,
    drafts: projects.filter((p) => p.status === "draft" || p.paymentState === "unpaid").length,
    disputes: projects.filter((p) => p.paymentState === "disputed").length,
  };

  const summary = [
    { label: "Active projects", value: counts.active, icon: Briefcase, to: "/dashboard/marketplace/projects" as const, hint: "TAKATAK is delivering work for you" },
    { label: "Awaiting your approval", value: counts.approval, icon: FileCheck2, to: "/dashboard/marketplace/deliveries" as const, hint: "Deliveries TAKATAK has reviewed" },
    { label: "Deliveries to review", value: counts.deliveries, icon: Inbox, to: "/dashboard/marketplace/deliveries" as const, hint: "New files from the freelancer" },
    { label: "Drafts & unpaid", value: counts.drafts, icon: Save, to: "/marketplace/post-project" as const, hint: "Continue or post a new project" },
    { label: "Disputes", value: counts.disputes, icon: AlertTriangle, to: "/dashboard/marketplace/messages" as const, hint: "TAKATAK mediates open issues" },
  ];

  return (
    <DashboardShell>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Track every project TAKATAK is running for you. We manage the freelancer relationship — you just review and approve.
          </p>
        </div>
        <Link
          to="/marketplace/post-project"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90"
        >
          <Plus size={14} /> Post a project
        </Link>
      </div>

      <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary">
        <ShieldCheck size={13} /> TAKATAK holds your payments in escrow and releases them only after you approve the delivery.
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label} to={s.to}
              className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors block"
            >
              <div className="flex items-center justify-between">
                <Icon size={16} className="text-muted-foreground" />
                <span className="text-2xl font-bold text-foreground">{s.value}</span>
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">{s.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.hint}</div>
            </Link>
          );
        })}
      </div>

      {projects.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h3 className="font-semibold text-foreground">No projects yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            When you post a project, TAKATAK assigns a vetted freelancer within 24 hours. You'll see live status, messages and deliveries here.
          </p>
          <div className="mt-5 flex justify-center gap-3 flex-wrap">
            <Link to="/marketplace/post-project" className="px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90">Post your first project</Link>
            <Link to="/marketplace" className="px-4 py-2 rounded-md text-sm font-semibold border border-border hover:bg-secondary">Browse packages</Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border text-sm font-semibold">Recent projects</div>
          <ul className="divide-y divide-border">
            {projects.slice(0, 8).map((p) => (
              <li key={p.id}>
                <Link
                  to="/dashboard/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-secondary/40"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.category} · {paymentReleaseLabel(p.paymentState)}</div>
                  </div>
                  <PaymentReleaseStatus state={p.paymentState} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/dashboard/marketplace/projects" className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
          <h4 className="font-semibold">All projects</h4>
          <p className="mt-1 text-xs text-muted-foreground">Active, drafts, completed and cancelled.</p>
        </Link>
        <Link to="/dashboard/marketplace/messages" className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
          <h4 className="font-semibold">Messages</h4>
          <p className="mt-1 text-xs text-muted-foreground">All communication runs through TAKATAK.</p>
        </Link>
        <Link to="/dashboard/marketplace/deliveries" className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
          <h4 className="font-semibold">Deliveries</h4>
          <p className="mt-1 text-xs text-muted-foreground">Review, approve or request a revision.</p>
        </Link>
      </div>
    </DashboardShell>
  );
}
