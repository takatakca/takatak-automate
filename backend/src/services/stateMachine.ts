import type { ServiceState } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const ALLOWED: Record<ServiceState, ServiceState[]> = {
  draft: ["checkout_started", "intake_required", "cancelled"],
  checkout_started: ["payment_pending", "cancelled"],
  payment_pending: ["paid", "failed", "cancelled"],
  paid: ["provisioning_queued", "intake_required"],
  provisioning_queued: ["provisioning_running", "failed"],
  provisioning_running: ["active", "intake_required", "ai_processing", "failed", "waiting_for_takatak"],
  intake_required: ["ai_processing", "waiting_for_takatak", "cancelled"],
  ai_processing: ["waiting_for_client", "waiting_for_takatak", "active", "failed"],
  waiting_for_client: ["ai_processing", "active", "cancelled"],
  waiting_for_takatak: ["active", "failed", "completed"],
  active: ["completed", "failed"],
  failed: ["provisioning_queued", "waiting_for_takatak", "cancelled"],
  cancelled: [],
  completed: [],
};

export interface TransitionInput {
  serviceInstanceId: string;
  next: ServiceState;
  label?: string;
  message?: string;
  actor?: "system" | "client" | "takatak";
}

export async function transition({
  serviceInstanceId,
  next,
  label,
  message,
  actor = "system",
}: TransitionInput) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.serviceInstance.findUnique({ where: { id: serviceInstanceId } });
    if (!current) throw new Error("service_instance_not_found");
    const allowed = ALLOWED[current.state].includes(next);
    if (!allowed && current.state !== next) {
      throw new Error(`illegal_transition_${current.state}_to_${next}`);
    }
    const updated = await tx.serviceInstance.update({
      where: { id: serviceInstanceId },
      data: { state: next },
    });
    await tx.automationTimelineEvent.create({
      data: { serviceInstanceId, state: next, label, message, actor },
    });
    return updated;
  });
}
