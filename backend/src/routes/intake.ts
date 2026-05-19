import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { transition } from "../services/stateMachine.js";

export const intakeRouter = Router();

const Body = z.object({
  serviceKey: z.string().min(1).max(64),
  answers: z.record(z.string(), z.unknown()),
  serviceInstanceId: z.string().optional(),
});

intakeRouter.post("/ai/intake/start", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const { serviceKey, answers, serviceInstanceId } = parsed.data;

  // Verify ownership if instance id supplied
  if (serviceInstanceId) {
    const owned = await prisma.serviceInstance.findFirst({
      where: { id: serviceInstanceId, userId: req.userId! },
      select: { id: true },
    });
    if (!owned) return res.status(404).json({ error: "service_instance_not_found" });
  }

  const intake = await prisma.aIIntake.create({
    data: {
      userId: req.userId!,
      serviceKey,
      serviceInstanceId: serviceInstanceId ?? null,
      answers,
    },
  });

  let nextAction: "ai_processing" | "waiting_for_takatak" | "none" = "none";
  if (serviceInstanceId) {
    // Queue AI processing; real worker handles brief generation.
    await prisma.automationJob.create({
      data: {
        serviceInstanceId,
        kind: "ai_intake_processing",
        payload: { intakeId: intake.id },
      },
    });
    await transition({
      serviceInstanceId,
      next: "ai_processing",
      label: "AI processing intake",
      actor: "system",
    });
    await prisma.serviceInstance.update({ where: { id: serviceInstanceId }, data: { intakeId: intake.id } });
    nextAction = "ai_processing";
  }

  res.json({ intakeId: intake.id, serviceInstanceId: serviceInstanceId ?? null, nextAction });
});
