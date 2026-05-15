export type ServiceState =
  | "draft"
  | "checkout_started"
  | "payment_pending"
  | "paid"
  | "provisioning_queued"
  | "provisioning_running"
  | "intake_required"
  | "ai_processing"
  | "waiting_for_client"
  | "waiting_for_takatak"
  | "active"
  | "failed"
  | "cancelled"
  | "completed";

const labels: Record<ServiceState, string> = {
  draft: "Draft",
  checkout_started: "Checkout started",
  payment_pending: "Payment pending",
  paid: "Paid",
  provisioning_queued: "Provisioning queued",
  provisioning_running: "Provisioning",
  intake_required: "Intake required",
  ai_processing: "AI processing",
  waiting_for_client: "Waiting on you",
  waiting_for_takatak: "TAKATAK reviewing",
  active: "Active",
  failed: "Failed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const colors: Record<ServiceState, string> = {
  draft: "bg-muted text-muted-foreground",
  checkout_started: "bg-warning/20 text-warning",
  payment_pending: "bg-warning/20 text-warning",
  paid: "bg-primary/20 text-primary",
  provisioning_queued: "bg-primary/20 text-primary",
  provisioning_running: "bg-primary/20 text-primary",
  intake_required: "bg-accent/20 text-accent",
  ai_processing: "bg-accent/20 text-accent",
  waiting_for_client: "bg-warning/20 text-warning",
  waiting_for_takatak: "bg-muted text-muted-foreground",
  active: "bg-success/20 text-success",
  failed: "bg-destructive/20 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
  completed: "bg-success/20 text-success",
};

const nextActions: Record<ServiceState, string> = {
  draft: "Continue setup",
  checkout_started: "Complete checkout",
  payment_pending: "Confirm payment",
  paid: "Awaiting provisioning",
  provisioning_queued: "In queue",
  provisioning_running: "Provisioning in progress",
  intake_required: "Complete AI intake",
  ai_processing: "AI is preparing your project",
  waiting_for_client: "Provide more info",
  waiting_for_takatak: "TAKATAK team reviewing",
  active: "Open service",
  failed: "Retry or contact support",
  cancelled: "Restart service",
  completed: "View results",
};

const clientActionStates: ServiceState[] = [
  "draft",
  "checkout_started",
  "payment_pending",
  "intake_required",
  "waiting_for_client",
];

const staffActionStates: ServiceState[] = [
  "waiting_for_takatak",
  "failed",
];

export function getServiceStateLabel(state: ServiceState): string {
  return labels[state] ?? state;
}

export function getServiceStateColor(state: ServiceState): string {
  return colors[state] ?? "bg-muted text-muted-foreground";
}

export function getNextServiceAction(state: ServiceState): string {
  return nextActions[state] ?? "View service";
}

export function isClientActionRequired(state: ServiceState): boolean {
  return clientActionStates.includes(state);
}

export function isStaffActionRequired(state: ServiceState): boolean {
  return staffActionStates.includes(state);
}

/** Canonical timeline order for the AutomationTimeline component */
export const timelineOrder: ServiceState[] = [
  "checkout_started",
  "paid",
  "provisioning_queued",
  "provisioning_running",
  "intake_required",
  "ai_processing",
  "active",
];