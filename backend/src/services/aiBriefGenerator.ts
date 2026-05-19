import { env } from "../lib/env.js";

export interface IntakeAnswers { [key: string]: unknown }

export interface BriefResult {
  brief: string;
  source: "ai" | "template";
}

/**
 * Generates a structured project brief from intake answers.
 *
 * If LOVABLE_API_KEY is missing, returns a deterministic template brief and
 * the caller MUST route the service to `waiting_for_takatak` so a human can
 * complete it. We never fabricate AI output.
 */
export async function generateBrief(serviceKey: string, answers: IntakeAnswers): Promise<BriefResult | null> {
  if (!env.LOVABLE_API_KEY) return null;

  const messages = [
    {
      role: "system" as const,
      content:
        "You write concise structured project briefs for TAKATAK. Output sections: Summary, Goals, Audience, Scope, Deliverables, Open Questions. No fluff.",
    },
    {
      role: "user" as const,
      content: `Service: ${serviceKey}\n\nIntake answers (JSON):\n${JSON.stringify(answers, null, 2)}`,
    },
  ];

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, stream: false }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const brief = data.choices?.[0]?.message?.content?.trim();
  if (!brief) return null;
  return { brief, source: "ai" };
}

export function templateBrief(serviceKey: string, answers: IntakeAnswers): string {
  return [
    `# TAKATAK Intake — ${serviceKey}`,
    "",
    "## Raw answers",
    "```json",
    JSON.stringify(answers, null, 2),
    "```",
    "",
    "_AI brief generation was unavailable; a TAKATAK team member will review and finalize this brief._",
  ].join("\n");
}
