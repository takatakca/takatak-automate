import { Router, raw } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import { verifyHmac } from "../lib/signing.js";
import { transition } from "../services/stateMachine.js";
import {
  verifyPaymentWebhook,
  mapPaymentEventToOrderState,
} from "../services/payments.js";

export const webhooksRouter = Router();

/**
 * Upmind webhook payload (documented expectations):
 * - `id`: unique Upmind event id (used for idempotency)
 * - `type`: one of "order.paid" | "service.active" | "service.suspended" | "order.cancelled"
 * - `orderId`: Upmind order id (optional, used to locate ServiceInstance)
 * - `serviceId`: Upmind service id (optional, used to locate ServiceInstance)
 * - `userId`: TAKATAK user id (only required if creating a new instance)
 * - `serviceKey`: TAKATAK service key (only required if creating a new instance)
 *
 * Signature: HMAC-SHA256(UPMIND_WEBHOOK_SECRET, raw_body) in header `x-webhook-signature`.
 */
const UpmindPayload = z.object({
  id: z.string().min(1),
  type: z.enum(["order.paid", "service.active", "service.suspended", "order.cancelled"]),
  orderId: z.string().optional(),
  serviceId: z.string().optional(),
  userId: z.string().optional(),
  serviceKey: z.string().optional(),
});

/** Returns true if this event id has already been processed. */
async function alreadyProcessed(id: string, source: string): Promise<boolean> {
  try {
    await prisma.webhookEvent.create({ data: { id, source } });
    return false;
  } catch {
    return true; // unique constraint -> duplicate
  }
}

webhooksRouter.post(
  "/api/public/webhooks/upmind",
  raw({ type: "application/json" }),
  async (req, res) => {
    const body = req.body as Buffer;
    const sig = req.header("x-webhook-signature");
    if (env.UPMIND_WEBHOOK_SECRET) {
      if (!verifyHmac(env.UPMIND_WEBHOOK_SECRET, body.toString("utf8"), sig ?? null)) {
        return res.status(401).send("invalid_signature");
      }
    }
    const parsed = UpmindPayload.safeParse(JSON.parse(body.toString("utf8")));
    if (!parsed.success) return res.status(400).send("invalid_payload");
    const p = parsed.data;

    if (await alreadyProcessed(p.id, "upmind")) {
      return res.json({ received: true, duplicate: true, processed: false });
    }

    let instance =
      (p.orderId &&
        (await prisma.serviceInstance.findFirst({ where: { upmindOrderId: p.orderId } }))) ||
      (p.serviceId &&
        (await prisma.serviceInstance.findFirst({ where: { upmindServiceId: p.serviceId } })));

    if (!instance && p.userId && p.serviceKey) {
      instance = await prisma.serviceInstance.create({
        data: {
          userId: p.userId,
          serviceKey: p.serviceKey,
          upmindOrderId: p.orderId,
          upmindServiceId: p.serviceId,
        },
      });
    }
    if (!instance) return res.status(202).json({ received: true, duplicate: false, processed: false, reason: "no_match" });

    if (p.type === "order.paid") {
      await transition({ serviceInstanceId: instance.id, next: "paid", label: "Payment confirmed" });
      await transition({ serviceInstanceId: instance.id, next: "provisioning_queued", label: "Queued" });
    } else if (p.type === "service.active") {
      await transition({ serviceInstanceId: instance.id, next: "active", label: "Service active" });
    } else if (p.type === "service.suspended") {
      await transition({ serviceInstanceId: instance.id, next: "failed", label: "Suspended" });
    } else if (p.type === "order.cancelled") {
      await transition({ serviceInstanceId: instance.id, next: "cancelled", label: "Cancelled" });
    }
    res.json({ received: true, duplicate: false, processed: true });
  },
);

const AutomationPayload = z.object({
  id: z.string().min(1),
  serviceInstanceId: z.string(),
  state: z.enum([
    "draft","checkout_started","payment_pending","paid","provisioning_queued",
    "provisioning_running","intake_required","ai_processing","waiting_for_client",
    "waiting_for_takatak","active","failed","cancelled","completed",
  ]),
  label: z.string().optional(),
  message: z.string().optional(),
  jobId: z.string().optional(),
  jobStatus: z.enum(["queued","running","succeeded","failed","cancelled"]).optional(),
  jobError: z.string().optional(),
});

webhooksRouter.post(
  "/api/public/webhooks/automation",
  raw({ type: "application/json" }),
  async (req, res) => {
    const body = req.body as Buffer;
    const sig = req.header("x-webhook-signature");
    if (env.AUTOMATION_WEBHOOK_SECRET) {
      if (!verifyHmac(env.AUTOMATION_WEBHOOK_SECRET, body.toString("utf8"), sig ?? null)) {
        return res.status(401).send("invalid_signature");
      }
    }
    const parsed = AutomationPayload.safeParse(JSON.parse(body.toString("utf8")));
    if (!parsed.success) return res.status(400).send("invalid_payload");
    const p = parsed.data;

    if (await alreadyProcessed(p.id, "automation")) {
      return res.json({ received: true, duplicate: true, processed: false });
    }

    await transition({
      serviceInstanceId: p.serviceInstanceId,
      next: p.state,
      label: p.label,
      message: p.message,
    });
    if (p.jobId) {
      await prisma.automationJob.update({
        where: { id: p.jobId },
        data: { status: p.jobStatus ?? "succeeded", lastError: p.jobError ?? null },
      }).catch(() => undefined);
    }
    res.json({ received: true, duplicate: false, processed: true });
  },
);

/**
 * Payment processor webhook (Stripe-compatible).
 *
 * Requires raw body. Signature verified via verifyPaymentWebhook using
 * STRIPE_WEBHOOK_SECRET. Idempotent on provider event id. Never marks an
 * order paid unless the signature verifies successfully.
 */
webhooksRouter.post(
  "/api/public/webhooks/payments",
  raw({ type: "application/json" }),
  async (req, res) => {
    const body = req.body as Buffer;
    const sig = req.header("stripe-signature") ?? req.header("x-webhook-signature");
    const event = verifyPaymentWebhook(body.toString("utf8"), sig);
    if (!event) return res.status(401).send("invalid_signature");

    if (await alreadyProcessed(event.id, "payments")) {
      return res.json({ received: true, duplicate: true, processed: false });
    }

    const next = mapPaymentEventToOrderState(event);
    if (!next) {
      return res.json({ received: true, duplicate: false, processed: false, reason: "ignored_event_type" });
    }

    const orderId = event.orderId;
    if (!orderId) {
      return res.status(202).json({ received: true, processed: false, reason: "no_order_ref" });
    }
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(202).json({ received: true, processed: false, reason: "order_not_found" });
    }

    const orderStatus =
      next === "paid_to_takatak" ? "paid_to_takatak" :
      next === "cancelled" ? "cancelled" :
      next === "refunded" ? "refunded" :
      next === "failed" ? "unpaid" :
      next === "payment_pending" ? "checkout_started" :
      order.status;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        meta: {
          ...(order.meta as object),
          lastPaymentEventId: event.id,
          lastPaymentEventType: event.type,
          providerSessionId: event.providerSessionId ?? (order.meta as any)?.providerSessionId ?? null,
        } as object,
      },
    });

    // Update service instance + project state when applicable.
    if (order.serviceInstanceId && next === "paid_to_takatak") {
      // Move state machine: draft/checkout_started -> payment_pending -> paid
      await transition({
        serviceInstanceId: order.serviceInstanceId,
        next: "payment_pending",
        label: "Payment received",
      }).catch(() => undefined);
      await transition({
        serviceInstanceId: order.serviceInstanceId,
        next: "paid",
        label: "Paid to TAKATAK",
      }).catch(() => undefined);
      await transition({
        serviceInstanceId: order.serviceInstanceId,
        next: "waiting_for_takatak",
        label: "Awaiting TAKATAK assignment",
      }).catch(() => undefined);
    }

    const meta = order.meta as { projectId?: string; kind?: string } | null;
    if (meta?.kind === "marketplace_project" && meta.projectId) {
      const paymentState =
        next === "paid_to_takatak" ? "paid_to_takatak" :
        next === "refunded" ? "refunded" :
        next === "cancelled" ? "cancelled" : null;
      if (paymentState) {
        await prisma.clientProject.update({
          where: { id: meta.projectId },
          data: { paymentState },
        }).catch(() => undefined);
        await prisma.projectAuditLog.create({
          data: {
            projectId: meta.projectId,
            actor: "payments",
            action: `payment.${next}`,
            data: { orderId: order.id, eventId: event.id, eventType: event.type },
          },
        }).catch(() => undefined);
      }
    }

    res.json({ received: true, duplicate: false, processed: true, mapped: next });
  },
);
