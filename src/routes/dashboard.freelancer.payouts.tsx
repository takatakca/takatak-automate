import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";
import { listContracts, listPayouts, type FreelancerContract } from "@/lib/freelancer";
import { PaymentReleaseStatus } from "@/components/marketplace/PaymentReleaseStatus";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dashboard/freelancer/payouts")({
  head: () => ({ meta: [{ title: "Payouts — TAKATAK" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: Page,
});

function fmt(c: { amountCents: number; currency: string }) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: c.currency || "CAD" })
    .format(c.amountCents / 100);
}

function Page() {
  const contracts = useQuery({ queryKey: ["freelancer", "contracts"], queryFn: listContracts, retry: false });
  const payouts = useQuery({ queryKey: ["freelancer", "payouts"], queryFn: listPayouts, retry: false });

  const rows: FreelancerContract[] = contracts.data?.contracts ?? [];
  const held = rows.filter((c) => c.paymentState === "grace_period" || c.paymentState === "approved");
  const releaseReady = rows.filter((c) => c.paymentState === "released" && c.status !== "completed");
  const released = payouts.data?.payouts ?? [];

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold">Payouts</h1>
      <p className="text-sm text-muted-foreground mt-1">
        TAKATAK holds client payment in escrow. Funds release after the grace period when there's no open dispute.
      </p>

      <div className="mt-4 rounded-md border border-warning/30 bg-warning/5 text-warning text-xs p-3 inline-flex items-center gap-2">
        <AlertTriangle size={14} /> Payout provider onboarding is required before automatic transfers. Until then, releases stay <strong>release-ready</strong> and TAKATAK pays out manually.
      </div>

      <Section title="Held — in grace period or awaiting release" empty="No held funds right now.">
        {held.map((c) => (
          <Row key={c.id}>
            <div className="min-w-0">
              <div className="font-semibold truncate">{c.projectTitle}</div>
              <div className="text-xs text-muted-foreground">Contract {c.id}</div>
            </div>
            <div className="text-sm">{fmt(c)}</div>
            <PaymentReleaseStatus state={c.paymentState} />
          </Row>
        ))}
      </Section>

      <Section title="Release-ready" empty="Nothing waiting for manual release.">
        {releaseReady.map((c) => (
          <Row key={c.id}>
            <div className="min-w-0">
              <div className="font-semibold truncate">{c.projectTitle}</div>
              <div className="text-xs text-muted-foreground">Contract {c.id}</div>
            </div>
            <div className="text-sm">{fmt(c)}</div>
            <span className="inline-flex items-center gap-1 text-xs text-success"><ShieldCheck size={12} /> Ready</span>
          </Row>
        ))}
      </Section>

      <Section title="Released" empty="No released payouts yet.">
        {released.map((p) => (
          <Row key={p.id}>
            <div className="min-w-0 font-mono text-xs">{p.contractId}</div>
            <div className="text-sm">{fmt(p)}</div>
            <div className="text-xs text-muted-foreground">{p.releasedAt ? new Date(p.releasedAt).toLocaleString() : ""}</div>
          </Row>
        ))}
      </Section>
    </DashboardShell>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  const isEmpty = !arr || arr.flat().filter(Boolean).length === 0;
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</h2>
      {isEmpty ? <EmptyState title={title} description={empty} /> : <div className="space-y-2">{children}</div>}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-3">{children}</div>;
}