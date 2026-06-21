import { type PaymentReleaseState, paymentReleaseLabel } from "@/lib/marketplace";
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

const TONE: Record<PaymentReleaseState, { cls: string; Icon: typeof Clock }> = {
  unpaid: { cls: "bg-muted text-muted-foreground", Icon: Clock },
  paid_to_takatak: { cls: "bg-primary/10 text-primary", Icon: ShieldCheck },
  assigned: { cls: "bg-primary/10 text-primary", Icon: ShieldCheck },
  accepted_by_freelancer: { cls: "bg-primary/10 text-primary", Icon: ShieldCheck },
  in_progress: { cls: "bg-accent/10 text-accent", Icon: Clock },
  submitted: { cls: "bg-accent/10 text-accent", Icon: Clock },
  revision_requested: { cls: "bg-warning/10 text-warning", Icon: AlertTriangle },
  approved: { cls: "bg-success/10 text-success", Icon: CheckCircle2 },
  grace_period: { cls: "bg-warning/10 text-warning", Icon: Clock },
  release_ready: { cls: "bg-warning/10 text-warning", Icon: ShieldCheck },
  released: { cls: "bg-success/10 text-success", Icon: CheckCircle2 },
  disputed: { cls: "bg-destructive/10 text-destructive", Icon: AlertTriangle },
  cancelled: { cls: "bg-muted text-muted-foreground", Icon: AlertTriangle },
  refunded: { cls: "bg-muted text-muted-foreground", Icon: AlertTriangle },
};

export function PaymentReleaseStatus({ state }: { state: PaymentReleaseState }) {
  const { cls, Icon } = TONE[state];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      <Icon size={12} /> {paymentReleaseLabel(state)}
    </span>
  );
}