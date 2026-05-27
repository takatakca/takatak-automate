import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ShieldCheck, ListChecks, MessageSquare, Upload, Check, X } from "lucide-react";
import { PaymentReleaseStatus } from "@/components/marketplace/PaymentReleaseStatus";
import { MilestoneTimeline } from "@/components/marketplace/MilestoneTimeline";
import { FileUploadPanel } from "@/components/marketplace/FileUploadPanel";

export const Route = createFileRoute("/dashboard/freelancer/contracts/$contractId")({
  head: () => ({ meta: [{ title: "Contract — TAKATAK" }] }),
  component: Page,
});

function Page() {
  const { contractId } = Route.useParams();

  return (
    <DashboardShell>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to="/dashboard/freelancer/contracts" className="text-xs text-muted-foreground hover:text-foreground">← All contracts</Link>
          <h1 className="mt-2 text-2xl font-bold">Contract {contractId}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            You work for Groupe TAKATAK on this contract. TAKATAK owns the client relationship and reviews every delivery before it reaches the client.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90">
            <Check size={14} /> Accept contract
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold border border-border hover:bg-secondary">
            <X size={14} /> Decline
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary">
          <ShieldCheck size={12} /> TAKATAK-managed contract
        </span>
        <PaymentReleaseStatus state="paid_to_takatak" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold">Assigned task</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              The contract brief will appear here once TAKATAK assigns this work. Deliver against the brief — do not contact the client directly. All updates flow through TAKATAK.
            </p>
            <ul className="mt-4 grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              <li><span className="text-muted-foreground">Category:</span> <span className="text-foreground">—</span></li>
              <li><span className="text-muted-foreground">Deadline:</span> <span className="text-foreground">—</span></li>
              <li><span className="text-muted-foreground">Revisions allowed:</span> <span className="text-foreground">—</span></li>
              <li><span className="text-muted-foreground">Confidentiality:</span> <span className="text-foreground">Required</span></li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold flex items-center gap-2"><Upload size={16} /> Upload delivery</h2>
            <p className="mt-1 text-xs text-muted-foreground">TAKATAK reviews your delivery before it reaches the client.</p>
            <div className="mt-3"><FileUploadPanel hint="Attach final files, source files and a short delivery note." /></div>
            <textarea
              placeholder="Delivery note for TAKATAK reviewers…"
              rows={3}
              className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="mt-3 flex justify-end">
              <button className="px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90">Submit to TAKATAK review</button>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold flex items-center gap-2"><MessageSquare size={16} /> Messages with TAKATAK</h2>
            <p className="mt-2 text-sm text-muted-foreground">No messages yet. Use this channel for questions, blockers and status updates. Do not contact the client directly.</p>
            <form className="mt-4 flex gap-2">
              <input placeholder="Write a message to TAKATAK…" className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <button type="button" className="px-4 py-2 rounded-md text-sm font-medium text-primary-foreground bg-primary hover:opacity-90">Send</button>
            </form>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold flex items-center gap-2"><ListChecks size={16} /> Milestones</h2>
            <div className="mt-3"><MilestoneTimeline milestones={[]} /></div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold">Payout</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Contract amount</span><span className="font-semibold">—</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">TAKATAK platform fee</span><span>—</span></div>
              <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground">Net payout</span><span className="font-semibold">—</span></div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Released after the client approves the delivery and the grace period ends. Client billing details are private and never shared with you.
            </p>
          </section>
        </aside>
      </div>
    </DashboardShell>
  );
}
