import { Router, type Request } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../lib/tokens.js";

export const hostingRequestsRouter = Router();

const HostingRequestSchema = z.object({
  planId: z.string().trim().min(1).max(120),
  planName: z.string().trim().min(1).max(120),
  contactName: z.string().trim().min(1).max(120),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  contactPhone: z.string().trim().min(5).max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(80).optional(),
}).refine((v) => Boolean(v.contactEmail || v.contactPhone), { message: "contact_required" });

function optionalUserId(req: Request): string | null {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const claims = verifyAccessToken(token);
    return claims.sub ?? claims.userId ?? null;
  } catch {
    return null;
  }
}

hostingRequestsRouter.post("/hosting-requests", async (req, res) => {
  const parsed = HostingRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const data = parsed.data;
  const userId = optionalUserId(req);
  const id = crypto.randomUUID();
  const rows = await prisma.$queryRaw<unknown[]>`
    INSERT INTO "HostingRequest" (
      "id", "userId", "planId", "planName", "contactName",
      "contactEmail", "contactPhone", "notes", "source", "updatedAt"
    ) VALUES (
      ${id}, ${userId}, ${data.planId}, ${data.planName}, ${data.contactName},
      ${data.contactEmail || null}, ${data.contactPhone || null}, ${data.notes || null},
      ${data.source ?? "upmind_fallback"}, NOW()
    ) RETURNING *
  `;
  return res.status(201).json({ request: rows[0] });
});