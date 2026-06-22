/**
 * Token utilities — access JWT signing/verify, refresh hashing, JWKS.
 *
 * Algorithm selection:
 *   - RS256 when AUTH_PRIVATE_KEY + AUTH_PUBLIC_KEY are configured
 *     (preferred; matches the legacy backend contract; serves a JWKS).
 *   - HS256 fallback using AUTH_JWT_SECRET (keeps dev/test usable).
 *
 * Keys are NEVER read from disk; the committed legacy keys/private.pem
 * MUST be rotated and supplied via env vars (or a secret manager).
 */
import crypto from "node:crypto";
import jwt, { type Algorithm, type Secret, type SignOptions, type JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "./env.js";

function normalizePem(v?: string): string | undefined {
  if (!v) return undefined;
  // Allow `\n`-encoded env values.
  return v.includes("\\n") ? v.replace(/\\n/g, "\n") : v;
}

const PRIVATE_KEY = normalizePem(env.AUTH_PRIVATE_KEY);
const PUBLIC_KEY = normalizePem(env.AUTH_PUBLIC_KEY);
const HAS_RS = Boolean(PRIVATE_KEY && PUBLIC_KEY);

export interface AccessClaims extends JwtPayload {
  sub: string;
  sid?: string;
  role?: string;
  email?: string;
  userId?: string;
}

/** Sign a short-lived access token. */
export function signAccessToken(payload: AccessClaims): string {
  const opts: SignOptions = {
    algorithm: HAS_RS ? ("RS256" as Algorithm) : ("HS256" as Algorithm),
    expiresIn: env.AUTH_ACCESS_TTL as SignOptions["expiresIn"],
    issuer: env.AUTH_ISSUER,
    keyid: HAS_RS ? env.AUTH_KID : undefined,
  };
  const key: Secret = HAS_RS ? (PRIVATE_KEY as Secret) : (env.AUTH_JWT_SECRET ?? "");
  if (!key) throw new Error("auth_not_configured");
  return jwt.sign(payload, key, opts);
}

/** Verify an access token; throws on failure. */
export function verifyAccessToken(token: string): AccessClaims {
  const key: Secret = HAS_RS ? (PUBLIC_KEY as Secret) : (env.AUTH_JWT_SECRET ?? "");
  if (!key) throw new Error("auth_not_configured");
  return jwt.verify(token, key, {
    algorithms: [HAS_RS ? "RS256" : "HS256"],
    issuer: env.AUTH_ISSUER,
  }) as AccessClaims;
}

export function randomRefreshToken(): string {
  return crypto.randomBytes(48).toString("base64url");
}

export async function hashRefreshToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function verifyRefreshToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

/** Build the JWKS document. Returns `null` when no RSA public key is configured. */
export async function getJwks(): Promise<{ keys: object[] } | null> {
  if (!HAS_RS) return null;
  const key = crypto.createPublicKey(PUBLIC_KEY as string);
  const jwk = key.export({ format: "jwk" }) as Record<string, unknown>;
  jwk.use = "sig";
  jwk.alg = "RS256";
  jwk.kid = env.AUTH_KID;
  return { keys: [jwk] };
}

export const TOKEN_RUNTIME = {
  algorithm: HAS_RS ? "RS256" : "HS256",
  jwksAvailable: HAS_RS,
} as const;