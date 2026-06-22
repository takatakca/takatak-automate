import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env.js";
import { verifyAccessToken } from "../lib/tokens.js";

export interface AuthedRequest extends Request {
  userId?: string;
  claims?: jwt.JwtPayload;
}

/** Accept sub | userId | id as the user identifier (compat across auth providers). */
function extractUserId(c: jwt.JwtPayload): string | null {
  const candidates = [c.sub, (c as any).userId, (c as any).id, (c as any).user_id];
  for (const v of candidates) if (typeof v === "string" && v.length > 0) return v;
  return null;
}

/** Accept roles[] | role | isAdmin for role checks. */
export function extractRoles(c: jwt.JwtPayload | undefined): string[] {
  if (!c) return [];
  const roles: string[] = [];
  if (Array.isArray((c as any).roles)) roles.push(...((c as any).roles as string[]));
  if (typeof (c as any).role === "string") roles.push((c as any).role);
  if ((c as any).isAdmin === true) roles.push("admin");
  return roles;
}

/**
 * Verifies a Bearer JWT minted by the existing TAKATAK auth service.
 * Supports HS256 via AUTH_JWT_SECRET. For RS256/JWKS auth providers, swap
 * jwt.verify for jwks-rsa (the rest of this middleware is unchanged).
 *
 * REQUIRED CLAIMS (any one of each accepted):
 *   user id:  `sub` | `userId` | `id` | `user_id`
 *   roles:    `roles[]` | `role` | `isAdmin`
 */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing_bearer_token" });
  try {
    const claims = verifyAccessToken(token) as jwt.JwtPayload;
    const userId = extractUserId(claims);
    if (!userId) return res.status(401).json({ error: "invalid_token_subject" });
    req.userId = userId;
    req.claims = claims;
    next();
  } catch (e) {
    if ((e as Error).message === "auth_not_configured") {
      return res.status(500).json({ error: "auth_not_configured" });
    }
    return res.status(401).json({ error: "invalid_token" });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!extractRoles(req.claims).includes("admin")) {
    return res.status(403).json({ error: "forbidden" });
  }
  next();
}
