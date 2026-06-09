import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";
import { adminSweepPayouts, listAdminProjects } from "@/lib/admin";
import { PaymentReleaseStatus } from "@/components/marketplace/PaymentReleaseStatus";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/payouts")({
  head: () => ({
    meta: [{ title: "Admin · Payouts — TAKATAK" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const ready = useQuery({
    queryKey: ["admin", "projects", "release_ready"],
    queryFn: () => listAdminProjects("release_ready"),
    retry: false,
  });
  const disputed = useQuery({
    queryKey: ["admin", "projects", "disputed"],
    queryFn: () => listAdminProjects("disputed"),
    retry: false,
  });
  const sweep = useMutation({
    mutationFn: () => adminSweepPayouts(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });

  return (
    <DashboardShell>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Payouts</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            TAKATAK manual payout console. Release happens only when grace period has ended and no dispute is open. This view never marks payouts as paid out — it surfaces what needs human action.
          </p>
        </div>
        <button
          onClick={() => sweep.mutate()}
          disabled={sweep.isPending}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90"
        >
          <ShieldCheck size={14} /> Run sweep
        </button>
      </div>

      <div className="mt-4 rounded-md border border-warning/30 bg-warning/5 text-warning text-xs p-3 inline-flex items-center gap-2">
        <AlertTriangle size={14} /> Stripe Connect not configured by default — releases stay in release-ready state and require manual payout.
      </div>

      <Section title="Release-ready">
        {(ready.data?.projects ?? []).length === 0 && <EmptyState title="Nothing release-ready" description="No completed projects awaiting payout right now." />}
        {(ready.data?.projects ?? []).map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-semibold truncate">{p.title}</div>
              <div className="text-xs text-muted-foreground">{p.id}</div>
            </div>
            <PaymentReleaseStatus state={p.paymentState} />
          </div>
        ))}
      </Section>

      <Section title="Disputed">
        {(disputed.data?.projects ?? []).length === 0 && <EmptyState title="No disputes" description="No projects are currently in a disputed state." />}
        {(disputed.data?.projects ?? []).map((p) => (
          <div key={p.id} className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="font-semibold">{p.title}</div>
            <div className="text-xs text-muted-foreground">{p.id}</div>
          </div>
        ))}
      </Section>
    </DashboardShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}