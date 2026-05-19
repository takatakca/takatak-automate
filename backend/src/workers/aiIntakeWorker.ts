/**
 * AI intake worker.
 *
 * - Polls AutomationJob rows with kind="ai_intake_processing".
 * - Recovers stuck "running" jobs older than WORKER_STUCK_MS back to "queued".
 * - Caps retries at WORKER_MAX_ATTEMPTS with exponential backoff (visible via
 *   updatedAt: a job stays "queued" but is skipped until its backoff window
 *   elapses).
 * - Routes to human (waiting_for_takatak) when AI is unreachable — never fakes.
 * - Graceful shutdown on SIGTERM/SIGINT.
 *
 * Run as a Render "Background Worker":
 *   startCommand: node dist/workers/aiIntakeWorker.js
 */
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import { initSentry, captureException } from "../lib/sentry.js";
import { transition } from "../services/stateMachine.js";
import { generateBrief, templateBrief } from "../services/aiBriefGenerator.js";

initSentry();

const POLL_MS = env.WORKER_POLL_MS;
const BATCH = env.WORKER_BATCH;
const MAX_ATTEMPTS = env.WORKER_MAX_ATTEMPTS;
const STUCK_MS = env.WORKER_STUCK_MS;

let shuttingDown = false;

function log(event: string, data: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ component: "aiIntakeWorker", event, ...data }));
}

function backoffMs(attempts: number) {
  // 5s, 15s, 45s, 2m15s, 6m45s ... capped at 15 minutes.
  return Math.min(15 * 60_000, 5_000 * Math.pow(3, Math.max(0, attempts - 1)));
}

async function recoverStuck() {
  const cutoff = new Date(Date.now() - STUCK_MS);
  const { count } = await prisma.automationJob.updateMany({
    where: { kind: "ai_intake_processing", status: "running", updatedAt: { lt: cutoff } },
    data: { status: "queued", lastError: "recovered_from_stuck" },
  });
  if (count > 0) log("recovered_stuck_jobs", { count });
}

async function processOne(jobId: string) {
  const job = await prisma.automationJob.update({
    where: { id: jobId },
    data: { status: "running", attempts: { increment: 1 } },
  });
  log("picked", { jobId, attempts: job.attempts });

  const payload = job.payload as { intakeId?: string };
  const intakeId = payload?.intakeId;
  if (!intakeId || !job.serviceInstanceId) {
    await prisma.automationJob.update({
      where: { id: job.id },
      data: { status: "failed", lastError: "missing_intake_or_service" },
    });
    log("failed", { jobId, reason: "missing_intake_or_service" });
    return;
  }
  const intake = await prisma.aIIntake.findUnique({ where: { id: intakeId } });
  if (!intake) {
    await prisma.automationJob.update({
      where: { id: job.id },
      data: { status: "failed", lastError: "intake_not_found" },
    });
    log("failed", { jobId, reason: "intake_not_found" });
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
    log("completed", { jobId, serviceInstanceId: job.serviceInstanceId });
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
    await prisma.automationJob.update({
      where: { id: job.id },
      data: { status: "succeeded", lastError: "ai_unavailable_routed_to_human" },
    });
    log("routed_to_human", { jobId, serviceInstanceId: job.serviceInstanceId });
  }
}

async function tick() {
  await recoverStuck();

  const candidates = await prisma.automationJob.findMany({
    where: { kind: "ai_intake_processing", status: "queued" },
    orderBy: { createdAt: "asc" },
    take: BATCH * 4,
  });

  const now = Date.now();
  const ready = candidates.filter((j) => {
    if (j.attempts >= MAX_ATTEMPTS) return false;
    if (j.attempts === 0) return true;
    return now - new Date(j.updatedAt).getTime() >= backoffMs(j.attempts);
  }).slice(0, BATCH);

  // Permanently fail any job past the attempt cap.
  const overLimit = candidates.filter((j) => j.attempts >= MAX_ATTEMPTS);
  for (const j of overLimit) {
    await prisma.automationJob.update({
      where: { id: j.id },
      data: { status: "failed", lastError: `max_attempts_${MAX_ATTEMPTS}_reached` },
    });
    log("failed", { jobId: j.id, reason: "max_attempts_reached", attempts: j.attempts });
  }

  for (const job of ready) {
    if (shuttingDown) break;
    try {
      await processOne(job.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown_error";
      await prisma.automationJob.update({
        where: { id: job.id },
        data: { status: "queued", lastError: msg }, // re-queue; backoff applies next tick
      });
      log("error", { jobId: job.id, message: msg });
      captureException(e, { jobId: job.id });
    }
  }
}

async function main() {
  log("starting", { pollMs: POLL_MS, batch: BATCH, maxAttempts: MAX_ATTEMPTS });
  while (!shuttingDown) {
    try { await tick(); }
    catch (e) { log("tick_error", { message: e instanceof Error ? e.message : String(e) }); captureException(e); }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  await prisma.$disconnect();
  log("stopped");
  process.exit(0);
}

function shutdown(sig: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  log("shutdown_signal", { signal: sig });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

main();
