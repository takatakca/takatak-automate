import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env.js";

export interface AuthedRequest extends Request {
  userId?: string;
  claims?: jwt.JwtPayload;
}

/**
 * Verifies a Bearer JWT minted by the existing TAKATAK auth service.
 * Supports a shared secret (AUTH_JWT_SECRET). For production, prefer
 * AUTH_JWKS_URL + jwks-rsa (left as TODO to keep deps light).
 */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing_bearer_token" });

  try {
    if (!env.AUTH_JWT_SECRET) {
      return res.status(500).json({ error: "auth_not_configured" });
    }
    const claims = jwt.verify(token, env.AUTH_JWT_SECRET) as jwt.JwtPayload;
    const sub = claims.sub;
    if (!sub || typeof sub !== "string") {
      return res.status(401).json({ error: "invalid_token_subject" });
    }
    req.userId = sub;
    req.claims = claims;
    next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const roles = (req.claims?.roles as string[] | undefined) ?? [];
  if (!roles.includes("admin")) return res.status(403).json({ error: "forbidden" });
  next();
}
