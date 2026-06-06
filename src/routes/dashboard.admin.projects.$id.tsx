import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PaymentReleaseStatus } from "@/components/marketplace/PaymentReleaseStatus";
import {
  getAdminProject,
  adminAssign,
  adminApproveDelivery,
  adminRequestRevision,
  adminStartGracePeriod,
  adminReleasePayment,
  adminDispute,
} from "@/lib/admin";

export const Route = createFileRoute("/dashboard/admin/projects/$id")({
  head: () => ({
    meta: [
      { title: "Admin · Project — TAKATAK" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const q = useQuery({ queryKey: ["admin", "project", id], queryFn: () => getAdminProject(id), retry: false });
  const project = q.data?.project;
  const [freelancerId, setFreelancerId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    try { await fn(); await q.refetch(); }
    finally { setBusy(null); }
  }

  return (
    <DashboardShell>
      <Link to="/dashboard/admin/projects" className="text-xs text-muted-foreground hover:text-foreground">← All projects</Link>
      {!project ? (
        <div className="mt-6 text-sm text-muted-foreground">{q.isError ? "Cannot load. Admin access required." : "Loading…"}</div>
      ) : (
        <>
          <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{project.category} · {project.id}</p>
            </div>
            <PaymentReleaseStatus state={project.paymentState} />
          </div>

          <p className="mt-4 max-w-3xl text-sm text-muted-foreground whitespace-pre-wrap">{project.brief}</p>

          <div className="mt-8 grid lg:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold">Assign freelancer</h2>
              <p className="mt-1 text-xs text-muted-foreground">Only paid projects can be assigned.</p>
              <div className="mt-3 space-y-2">
                <input value={freelancerId} onChange={(e) => setFreelancerId(e.target.value)} placeholder="Freelancer user id" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (cents CAD)" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (optional)" rows={2} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                <button
                  disabled={busy !== null || !freelancerId || !amount}
                  onClick={() => run("assign", () => adminAssign(id, { freelancerId, amountCents: parseInt(amount, 10), note: note || undefined }))}
                  className="w-full px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 disabled:opacity-60"
                >
                  {busy === "assign" ? "Assigning…" : "Assign"}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold">Delivery & payout</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <button disabled={busy !== null} onClick={() => run("rev", () => adminRequestRevision(id, "Please address review feedback."))} className="px-3 py-2 rounded-md border border-border hover:bg-secondary">Request revision</button>
                <button disabled={busy !== null} onClick={() => run("appr", () => adminApproveDelivery(id))} className="px-3 py-2 rounded-md border border-border hover:bg-secondary">Approve delivery</button>
                <button disabled={busy !== null} onClick={() => run("grace", () => adminStartGracePeriod(id))} className="px-3 py-2 rounded-md border border-border hover:bg-secondary">Start grace period</button>
                <button disabled={busy !== null} onClick={() => run("rel", () => adminReleasePayment(id))} className="px-3 py-2 rounded-md text-primary-foreground bg-primary hover:opacity-90">Release payment</button>
                <button disabled={busy !== null} onClick={() => run("disp", () => adminDispute(id, "Internal dispute opened."))} className="col-span-2 px-3 py-2 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/5">Open dispute</button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                If no payout provider is configured the release is marked <code>release_ready</code> instead of paying out.
              </p>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Contracts</h2>
            <ul className="mt-3 text-sm divide-y divide-border">
              {project.contracts.length === 0 && <li className="text-muted-foreground">No contracts yet.</li>}
              {project.contracts.map((c) => (
                <li key={c.id} className="py-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{c.freelancerId}</div>
                    <div className="text-xs text-muted-foreground">{c.id} · {c.status}</div>
                  </div>
                  <PaymentReleaseStatus state={c.paymentState} />
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Audit log</h2>
            <ul className="mt-3 text-xs divide-y divide-border max-h-80 overflow-auto">
              {project.audits.map((a) => (
                <li key={a.id} className="py-2 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{a.action}</div>
                    <div className="text-muted-foreground">by {a.actor}</div>
                  </div>
                  <time className="text-muted-foreground">{new Date(a.at).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </DashboardShell>
  );
}