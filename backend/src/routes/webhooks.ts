import { Router, raw } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import { verifyHmac } from "../lib/signing.js";
import { transition } from "../services/stateMachine.js";

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
      return res.json({ ok: true, duplicate: true });
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
    if (!instance) return res.status(202).send("no_match");

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
    res.json({ ok: true });
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
      return res.json({ ok: true, duplicate: true });
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
    res.json({ ok: true });
  },
);
