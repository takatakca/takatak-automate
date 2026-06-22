import { Router, type Request } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../lib/tokens.js";

export const domainRequestsRouter = Router();

const DomainRequestSchema = z.object({
  domain: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/),
  tld: z.enum(["ca", "com", "net", "org"]),
  contactName: z.string().trim().min(1).max(120),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  contactPhone: z.string().trim().min(5).max(40).optional().or(z.literal("")),
  source: z.string().trim().max(80).optional(),
}).refine((v) => v.domain.endsWith(`.${v.tld}`), { message: "domain_tld_mismatch" })
  .refine((v) => !v.domain.includes(".."), { message: "invalid_domain" })
  .refine((v) => Boolean(v.contactEmail || v.contactPhone), { message: "contact_required" });

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

domainRequestsRouter.post("/domain-requests", async (req, res) => {
  const parsed = DomainRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const data = parsed.data;
  const userId = optionalUserId(req);
  const request = await prisma.domainRequest.create({
    data: {
      userId,
      domain: data.domain,
      tld: data.tld,
      contactName: data.contactName,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      source: data.source ?? "upmind_fallback",
    },
  });
  return res.status(201).json({ request });
});