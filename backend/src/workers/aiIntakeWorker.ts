/**
 * AI intake worker.
 *
 * Picks pending `ai_intake_processing` jobs, generates a structured project
 * brief via the Lovable AI Gateway, persists it on the AIIntake row, and
 * transitions the service instance.
 *
 * - If AI is reachable: brief is saved and instance → `waiting_for_client`
 *   (client reviews brief before TAKATAK starts work).
 * - If AI is NOT available (no key, network, or non-2xx): instance is moved
 *   to `waiting_for_takatak` so a human picks it up. We never fake completion.
 *
 * Run in production as a separate Render "background worker" service:
 *   startCommand: node dist/workers/aiIntakeWorker.js
 */
import { prisma } from "../lib/prisma.js";
import { transition } from "../services/stateMachine.js";
import { generateBrief, templateBrief } from "../services/aiBriefGenerator.js";

const POLL_MS = 5_000;
const BATCH = 5;

async function processOne(jobId: string) {
  const job = await prisma.automationJob.update({
    where: { id: jobId },
    data: { status: "running", attempts: { increment: 1 } },
  });
  const payload = job.payload as { intakeId?: string };
  const intakeId = payload?.intakeId;
  if (!intakeId || !job.serviceInstanceId) {
    await prisma.automationJob.update({
      where: { id: job.id },
      data: { status: "failed", lastError: "missing_intake_or_service" },
    });
    return;
  }
  const intake = await prisma.aIIntake.findUnique({ where: { id: intakeId } });
  if (!intake) {
    await prisma.automationJob.update({
      where: { id: job.id },
      data: { status: "failed", lastError: "intake_not_found" },
    });
    return;
  }

  const answers = (intake.answers as Record<string, unknown>) ?? {};
  const ai = await generateBrief(intake.serviceKey, answers);

  if (ai) {
    await prisma.aIIntake.update({ where: { id: intake.id }, data: { brief: ai.brief } });
    await transition({
      serviceInstanceId: job.serviceInstanceId,
      next: "waiting_for_client",
      label: "AI brief ready — awaiting client review",
    });
    await prisma.automationJob.update({ where: { id: job.id }, data: { status: "succeeded" } });
  } else {
    await prisma.aIIntake.update({
      where: { id: intake.id },
      data: { brief: templateBrief(intake.serviceKey, answers) },
    });
    await transition({
      serviceInstanceId: job.serviceInstanceId,
      next: "waiting_for_takatak",
      label: "Intake submitted — pending TAKATAK review",
    });
    // Mark job as succeeded — the work routed to a human, which is expected.
    await prisma.automationJob.update({
      where: { id: job.id },
      data: { status: "succeeded", lastError: "ai_unavailable_routed_to_human" },
    });
  }
}

async function tick() {
  const jobs = await prisma.automationJob.findMany({
    where: { kind: "ai_intake_processing", status: "queued" },
    orderBy: { createdAt: "asc" },
    take: BATCH,
  });
  for (const job of jobs) {
    try {
      await processOne(job.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown_error";
      await prisma.automationJob.update({
        where: { id: job.id },
        data: { status: "failed", lastError: msg },
      });
    }
  }
}

async function main() {
  console.log("[aiIntakeWorker] starting, poll interval", POLL_MS, "ms");
  // Simple polling loop. Replace with BullMQ/pg-boss for at-least-once semantics.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try { await tick(); } catch (e) { console.error("[aiIntakeWorker] tick error", e); }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main();
