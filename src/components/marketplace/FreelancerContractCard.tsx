import { Link } from "@tanstack/react-router";
import type { FreelancerContract } from "@/lib/freelancer";
import { PaymentReleaseStatus } from "./PaymentReleaseStatus";

export function FreelancerContractCard({ contract }: { contract: FreelancerContract }) {
  const amount = (contract.amountCents / 100).toLocaleString(undefined, {
    style: "currency", currency: contract.currency || "CAD",
  });
  return (
    <Link
      to="/dashboard/freelancer/contracts/$contractId"
      params={{ contractId: contract.id }}
      className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{contract.projectTitle}</div>
          <div className="text-xs text-muted-foreground mt-0.5 capitalize">Status: {contract.status.replace(/_/g, " ")}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-semibold">{amount}</div>
          <div className="mt-1"><PaymentReleaseStatus state={contract.paymentState} /></div>
        </div>
      </div>
    </Link>
  );
}