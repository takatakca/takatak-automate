import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, RefreshCw, XCircle } from "lucide-react";
import type { OrderPaymentStatus } from "@/lib/orders";

const MAP: Record<OrderPaymentStatus, { label: string; cls: string; Icon: typeof Clock }> = {
  unpaid: { label: "Checkout saved", cls: "bg-muted text-muted-foreground", Icon: Clock },
  checkout_started: { label: "Payment pending", cls: "bg-accent/10 text-accent", Icon: Clock },
  paid_to_takatak: { label: "Paid to TAKATAK", cls: "bg-primary/10 text-primary", Icon: ShieldCheck },
  waiting_for_takatak: { label: "Awaiting assignment", cls: "bg-primary/10 text-primary", Icon: Clock },
  quote_requested: { label: "Quote requested", cls: "bg-muted text-muted-foreground", Icon: Clock },
  assigned: { label: "Assigned", cls: "bg-primary/10 text-primary", Icon: ShieldCheck },
  in_progress: { label: "In progress", cls: "bg-accent/10 text-accent", Icon: Clock },
  submitted: { label: "Submitted for review", cls: "bg-accent/10 text-accent", Icon: Clock },
  approved: { label: "Approved", cls: "bg-success/10 text-success", Icon: CheckCircle2 },
  grace_period: { label: "Grace period", cls: "bg-warning/10 text-warning", Icon: Clock },
  released: { label: "Released / completed", cls: "bg-success/10 text-success", Icon: CheckCircle2 },
  disputed: { label: "Disputed", cls: "bg-destructive/10 text-destructive", Icon: AlertTriangle },
  refunded: { label: "Refunded", cls: "bg-muted text-muted-foreground", Icon: RefreshCw },
  cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground", Icon: XCircle },
};

export function OrderStatusBadge({ status }: { status: OrderPaymentStatus }) {
  const v = MAP[status] ?? MAP.unpaid;
  const { Icon } = v;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${v.cls}`}>
      <Icon size={12} /> {v.label}
    </span>
  );
}

export function orderNextAction(status: OrderPaymentStatus): string {
  switch (status) {
    case "unpaid": return "Complete checkout to start your order.";
    case "checkout_started": return "We're waiting for payment confirmation.";
    case "paid_to_takatak":
    case "waiting_for_takatak": return "TAKATAK is assigning a specialist.";
    case "quote_requested": return "TAKATAK is preparing your quote.";
    case "assigned":
    case "in_progress": return "Work is underway.";
    case "submitted": return "Review the delivery and approve or request a revision.";
    case "approved":
    case "grace_period": return "Funds will release after the grace period.";
    case "released": return "Order complete.";
    case "disputed": return "Our team is reviewing the dispute.";
    case "refunded": return "This order was refunded.";
    case "cancelled": return "This order was cancelled.";
    default: return "—";
  }
}