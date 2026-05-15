import { Check, Loader2 } from "lucide-react";
import {
  getServiceStateLabel,
  timelineOrder,
  type ServiceState,
} from "@/lib/automationStates";

const friendly: Record<ServiceState, string> = {
  draft: "Draft",
  checkout_started: "Order received",
  payment_pending: "Payment pending",
  paid: "Payment confirmed",
  provisioning_queued: "Provisioning queued",
  provisioning_running: "Setup running",
  intake_required: "Client information required",
  ai_processing: "AI checklist prepared",
  waiting_for_client: "Waiting on you",
  waiting_for_takatak: "TAKATAK reviewing",
  active: "Service active",
  failed: "Failed",
  cancelled: "Cancelled",
  completed: "Completed",
};

export function AutomationTimeline({ current }: { current: ServiceState }) {
  const idx = timelineOrder.indexOf(current);
  return (
    <ol className="space-y-4">
      {timelineOrder.map((state, i) => {
        const isDone = idx > i;
        const isCurrent = idx === i;
        return (
          <li key={state} className="flex items-start gap-3">
            <div
              className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                isDone
                  ? "bg-success/20 text-success"
                  : isCurrent
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? (
                <Check size={14} />
              ) : isCurrent ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                i + 1
              )}
            </div>
            <div className="flex-1">
              <div
                className={`text-sm font-medium ${
                  isCurrent ? "text-foreground" : isDone ? "text-foreground/80" : "text-muted-foreground"
                }`}
              >
                {friendly[state] ?? getServiceStateLabel(state)}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}