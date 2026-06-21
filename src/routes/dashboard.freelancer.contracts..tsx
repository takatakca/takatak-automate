import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ShieldCheck, ListChecks, MessageSquare, Upload, Check, X } from "lucide-react";
import { PaymentReleaseStatus } from "@/components/marketplace/PaymentReleaseStatus";
import { MilestoneTimeline } from "@/components/marketplace/MilestoneTimeline";
import { FileUploadPanel } from "@/components/marketplace/FileUploadPanel";
import {
  getContract,
  acceptContract,
  declineContract,
  sendContractMessage,
  submitContractDelivery,
  type FreelancerContract,
} from "@/lib/freelancer";

export const Route = createFileRoute("/dashboard/freelancer/contracts/$contractId")({
  head: () => ({ meta: [{ title: "Contract — TAKATAK" }] }),
  component: Page,
});

function dollars(cents: number, currency = "CAD") {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency });
}

function Page() {
  const { contractId } = Route.useParams();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["freelancer", "contract", contractId],
    queryFn: () => getContract(contractId),
    retry: false,
  });
  const contract: FreelancerContract | undefined = q.data?.contract;

  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["freelancer", "contract", contractId] });

  const accept = useMutation({
    mutationFn: () => acceptContract(contractId),
    onSuccess: () => { setActionMsg("Contract accepted."); invalidate(); },
    onError: () => setActionMsg("Couldn't accept right now."),
  });
  const decline = useMutation({
    mutationFn: () => declineContract(contractId),
    onSuccess: () => { setActionMsg("Contract declined."); invalidate(); },
    onError: () => setActionMsg("Couldn't decline right now."),
  });
  const send = useMutation({
    mutationFn: () => sendContractMessage(contractId, message),
    onSuccess: () => { setMessage(""); setActionMsg("Message sent to TAKATAK."); },
    onError: () => setActionMsg("Couldn't send message."),
  });
  const submit = useMutation({
    mutationFn: () => submitContractDelivery(contractId, { note: note || undefined }),
    onSuccess: () => { setNote(""); setActionMsg("Delivery submitted to TAKATAK review."); invalidate(); },
    onError: () => setActionMsg("Couldn't submit delivery."),
  });

  const canAct = contract?.status === "assigned";
  const canDeliver = contract && ["accepted", "in_progress"].includes(contract.status);

  return (
    <DashboardShell>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to="/dashboard/freelancer/contracts" className="text-xs text-muted-foreground hover:text-foreground">← All contracts</Link>
          <h1 className="mt-2 text-2xl font-bold">
            {contract?.projectTitle ?? `Contract ${contractId}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            You work for Groupe TAKATAK on this contract. TAKATAK owns the client relationship and reviews every delivery before it reaches the client.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            disabled={!canAct || accept.isPending}
            onClick={() => accept.mutate()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 disabled:opacity-50"
          >
            <Check size={14} /> {accept.isPending ? "Accepting…" : "Accept contract"}
          </button>
          <button
            disabled={!canAct || decline.isPending}
            onClick={() => decline.mutate()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold border border-border hover:bg-secondary disabled:opacity-50"
          >
            <X size={14} /> Decline
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary">
          <ShieldCheck size={12} /> TAKATAK-managed contract
        </span>
        {contract && <PaymentReleaseStatus state={contract.paymentState} />}
        {contract && (
          <span className="inline-flex items-center rounded-md border border-border bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground">
            Status: {contract.status}
          </span>
        )}
      </div>

      {actionMsg && (
        <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
          {actionMsg}
        </div>
      )}
      {q.isError && (
        <div className="mt-4 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs">
          Live contract data isn't loading. Sign in as the assigned freelancer to view this contract.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold">Assigned task</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Deliver against the brief TAKATAK shared in the project. Do not contact the client directly — all updates flow through TAKATAK.
            </p>
            <ul className="mt-4 grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              <li><span className="text-muted-foreground">Project:</span> <span className="text-foreground">{contract?.projectTitle ?? "—"}</span></li>
              <li><span className="text-muted-foreground">Contract:</span> <span className="text-foreground">{contractId}</span></li>
              <li><span className="text-muted-foreground">Amount:</span> <span className="text-foreground">{contract ? dollars(contract.amountCents, contract.currency) : "—"}</span></li>
              <li><span className="text-muted-foreground">Confidentiality:</span> <span className="text-foreground">Required</span></li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold flex items-center gap-2"><Upload size={16} /> Upload delivery</h2>
            <p className="mt-1 text-xs text-muted-foreground">TAKATAK reviews your delivery before it reaches the client.</p>
            <div className="mt-3"><FileUploadPanel hint="Attach final files, source files and a short delivery note." /></div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Delivery note for TAKATAK reviewers…"
              rows={3}
              className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="mt-3 flex justify-end">
              <button
                disabled={!canDeliver || submit.isPending}
                onClick={() => submit.mutate()}
                className="px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 disabled:opacity-50"
              >
                {submit.isPending ? "Submitting…" : "Submit to TAKATAK review"}
              </button>
            </div>
            {!canDeliver && contract && (
              <p className="mt-2 text-xs text-muted-foreground">Accept the contract first to enable delivery upload.</p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold flex items-center gap-2"><MessageSquare size={16} /> Messages with TAKATAK</h2>
            <p className="mt-2 text-sm text-muted-foreground">Use this channel for questions, blockers and status updates. Do not contact the client directly.</p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => { e.preventDefault(); if (message.trim()) send.mutate(); }}
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message to TAKATAK…"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={!message.trim() || send.isPending}
                className="px-4 py-2 rounded-md text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 disabled:opacity-50"
              >
                {send.isPending ? "Sending…" : "Send"}
              </button>
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
              <div className="flex justify-between"><span className="text-muted-foreground">Contract amount</span><span className="font-semibold">{contract ? dollars(contract.amountCents, contract.currency) : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payment state</span><span>{contract?.paymentState ?? "—"}</span></div>
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
