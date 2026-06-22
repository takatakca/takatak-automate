/**
 * Auth routes — ported from legacy controller/Auth.js onto Prisma/Postgres.
 *
 * Endpoints:
 *   POST /auth/register
 *   POST /auth/login            (email or phone; sends OTP)
 *   POST /auth/verify-otp       (issues access token + session, claims FIRST10)
 *   POST /auth/resend-code
 *   POST /auth/refresh          (cookie or body)
 *   POST /auth/logout
 *   GET  /auth/well-known/jwks.json
 */
import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import {
  signAccessToken,
  randomRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
  getJwks,
} from "../lib/tokens.js";
import {
  generateOtp, hashOtp, verifyOtpHash, otpExpiry,
  sendEmailOtp, sendPhoneOtp, checkPhoneOtp, normalizePhone,
} from "../services/otp.js";
import { ensureUpmindClient } from "../services/upmind.js";
import { claimPromotion } from "../services/promotions.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: env.AUTH_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

async function createSessionForUser(userId: string, req: Request, res: Response) {
  const sid = crypto.randomUUID();
  const refreshToken = randomRefreshToken();
  const refreshHash = await hashRefreshToken(refreshToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.AUTH_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: {
      id: sid,
      userId,
      refreshHash,
      expiresAt,
      deviceInfo: req.header("user-agent") ?? null,
      ip: req.ip ?? null,
    },
  });
  res.cookie("sid", sid, cookieOptions());
  res.cookie("refresh_token", refreshToken, cookieOptions());
  return { sid, refreshToken };
}

function publicUser<T extends { passwordHash?: string | null; encryptedPassword?: string | null; otpHash?: string | null }>(u: T) {
  const { passwordHash: _p, encryptedPassword: _e, otpHash: _o, ...rest } = u;
  void _p; void _e; void _o;
  return rest;
}

// --------------------------------------------------------------------------
// POST /auth/register
// --------------------------------------------------------------------------

const RegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(2).max(40).optional(),
  phone: z.string().min(5).optional(),
  password: z.string().min(8).max(200),
});

authRouter.post("/auth/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  const { firstName, lastName, email, username, phone, password } = parsed.data;
  const storedPhone = phone ? normalizePhone(phone) : null;
  const lowerEmail = email.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: lowerEmail }, storedPhone ? { phone: storedPhone } : { id: "__never__" }] },
  });
  if (existing) return res.status(409).json({ error: "user_exists" });
  if (username) {
    const u = await prisma.user.findFirst({ where: { username } });
    if (u) return res.status(409).json({ error: "username_taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const otpH = await hashOtp(otp);
  const user = await prisma.user.create({
    data: {
      firstName, lastName, email: lowerEmail, phone: storedPhone, username,
      passwordHash,
      otpHash: otpH,
      otpExpiresAt: otpExpiry(),
      lastOtpRequestedAt: new Date(),
    },
  });
  const send = await sendEmailOtp(lowerEmail, otp);
  return res.status(201).json({
    message: "registered_otp_sent",
    userId: user.id,
    otpDelivery: { ok: send.ok, channel: send.channel, provider: send.provider, reason: send.reason },
  });
});

// --------------------------------------------------------------------------
// POST /auth/login  (passwordless OTP login — by email or phone)
// --------------------------------------------------------------------------

const LoginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
}).refine((v) => Boolean(v.email || v.phone), { message: "email_or_phone_required" });

authRouter.post("/auth/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const { email, phone } = parsed.data;

  if (phone) {
    const p = normalizePhone(phone);
    const user = await prisma.user.findFirst({ where: { phone: p } });
    if (!user) return res.status(401).json({ error: "phone_not_found" });
    const send = await sendPhoneOtp(p);
    await prisma.user.update({ where: { id: user.id }, data: { lastOtpRequestedAt: new Date() } });
    return res.status(send.ok ? 200 : 502).json({
      message: send.ok ? "otp_sent" : "otp_channel_unavailable",
      channel: "phone",
      reason: send.reason,
    });
  }

  const lowerEmail = (email as string).toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
  if (!user) return res.status(401).json({ error: "email_not_found" });
  const otp = generateOtp();
  const otpH = await hashOtp(otp);
  await prisma.user.update({
    where: { id: user.id },
    data: { otpHash: otpH, otpExpiresAt: otpExpiry(), lastOtpRequestedAt: new Date() },
  });
  const send = await sendEmailOtp(lowerEmail, otp);
  return res.status(200).json({ message: "otp_sent", channel: "email", delivery: { ok: send.ok, provider: send.provider } });
});

// --------------------------------------------------------------------------
// POST /auth/verify-otp
// --------------------------------------------------------------------------

const VerifyOtpSchema = z.object({
  otp: z.string().min(4).max(10),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  promoCode: z.string().optional(),
}).refine((v) => Boolean(v.email || v.phone), { message: "email_or_phone_required" });

authRouter.post("/auth/verify-otp", async (req, res) => {
  const parsed = VerifyOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const { otp, email, phone, promoCode } = parsed.data;

  let user;
  if (phone) {
    const p = normalizePhone(phone);
    user = await prisma.user.findFirst({ where: { phone: p } });
    if (!user) return res.status(401).json({ error: "phone_not_found" });
    const check = await checkPhoneOtp(p, otp);
    if (!check.valid) return res.status(400).json({ error: "invalid_or_expired_otp", reason: check.reason });
  } else {
    const lowerEmail = (email as string).toLowerCase();
    user = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (!user) return res.status(400).json({ error: "email_not_found" });
    if (!user.otpHash || !user.otpExpiresAt) return res.status(400).json({ error: "otp_not_requested" });
    if (Date.now() > user.otpExpiresAt.getTime()) {
      await prisma.user.update({ where: { id: user.id }, data: { otpHash: null, otpExpiresAt: null } });
      return res.status(400).json({ error: "otp_expired" });
    }
    const ok = await verifyOtpHash(otp, user.otpHash);
    if (!ok) return res.status(400).json({ error: "invalid_otp" });
  }

  const wasVerified = user.isVerified;
  user = await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verifiedAt: user.verifiedAt ?? new Date(),
      otpHash: null,
      otpExpiresAt: null,
      lastAction: wasVerified ? "login" : "register",
      lastActionAt: new Date(),
    },
  });

  // Best-effort Upmind enrolment — never blocks auth.
  user = await ensureUpmindClient(user);

  const { sid } = await createSessionForUser(user.id, req, res);
  const accessToken = signAccessToken({
    sub: user.id,
    sid,
    role: user.role,
    email: user.email,
  });

  // FIRST10 (or other code) — claim post-verification. Best effort.
  let promotion: Awaited<ReturnType<typeof claimPromotion>> | undefined;
  if (promoCode) {
    promotion = await claimPromotion(user.id, promoCode).catch(() => undefined);
  }

  return res.status(200).json({
    message: "verified",
    token: accessToken,
    sid,
    userId: user.id,
    email: user.email,
    phone: user.phone,
    upmindClientId: user.upmindClientId,
    promotion: promotion && "promotion" in promotion ? promotion.promotion : null,
  });
});

// --------------------------------------------------------------------------
// POST /auth/resend-code
// --------------------------------------------------------------------------

authRouter.post("/auth/resend-code", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const cooldownMs = env.OTP_RESEND_COOLDOWN_SECONDS * 1000;
  const { email, phone } = parsed.data;

  if (phone) {
    const p = normalizePhone(phone);
    const user = await prisma.user.findFirst({ where: { phone: p } });
    if (!user) return res.status(401).json({ error: "phone_not_found" });
    if (user.lastOtpRequestedAt && Date.now() - user.lastOtpRequestedAt.getTime() < cooldownMs) {
      return res.status(429).json({ error: "cooldown" });
    }
    const send = await sendPhoneOtp(p);
    await prisma.user.update({ where: { id: user.id }, data: { lastOtpRequestedAt: new Date() } });
    return res.status(send.ok ? 200 : 502).json({ message: send.ok ? "otp_resent" : "otp_channel_unavailable", reason: send.reason });
  }

  const lowerEmail = (email as string).toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
  if (!user) return res.status(401).json({ error: "email_not_found" });
  if (user.lastOtpRequestedAt && Date.now() - user.lastOtpRequestedAt.getTime() < cooldownMs) {
    return res.status(429).json({ error: "cooldown" });
  }
  const otp = generateOtp();
  const otpH = await hashOtp(otp);
  await prisma.user.update({
    where: { id: user.id },
    data: { otpHash: otpH, otpExpiresAt: otpExpiry(), lastOtpRequestedAt: new Date() },
  });
  const send = await sendEmailOtp(lowerEmail, otp);
  return res.status(200).json({ message: "otp_resent", channel: "email", delivery: { ok: send.ok, provider: send.provider } });
});

// --------------------------------------------------------------------------
// POST /auth/refresh   (rotates refresh token, issues new access token)
// --------------------------------------------------------------------------

authRouter.post("/auth/refresh", async (req, res) => {
  const sid = (req as any).cookies?.sid ?? req.body?.sid;
  const provided = (req as any).cookies?.refresh_token ?? req.body?.refresh_token;
  if (!sid || !provided) return res.status(401).json({ error: "missing_refresh_credentials" });

  const session = await prisma.session.findUnique({ where: { id: sid }, include: { user: true } });
  if (!session || session.revoked) return res.status(401).json({ error: "invalid_session" });
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: sid } }).catch(() => {});
    res.clearCookie("sid"); res.clearCookie("refresh_token");
    return res.status(401).json({ error: "session_expired" });
  }
  const ok = await verifyRefreshToken(provided, session.refreshHash);
  if (!ok) {
    await prisma.session.update({ where: { id: sid }, data: { revoked: true } });
    res.clearCookie("sid"); res.clearCookie("refresh_token");
    return res.status(401).json({ error: "refresh_reuse_detected" });
  }

  const newToken = randomRefreshToken();
  const newHash = await hashRefreshToken(newToken);
  await prisma.session.update({
    where: { id: sid },
    data: {
      refreshHash: newHash,
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + env.AUTH_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  res.cookie("sid", sid, cookieOptions());
  res.cookie("refresh_token", newToken, cookieOptions());

  const accessToken = signAccessToken({
    sub: session.userId,
    sid,
    role: session.user.role,
    email: session.user.email,
  });
  return res.json({ accessToken });
});

// --------------------------------------------------------------------------
// POST /auth/logout
// --------------------------------------------------------------------------

authRouter.post("/auth/logout", requireAuth, async (req, res) => {
  const sid = (req as any).cookies?.sid ?? req.body?.sid;
  if (sid) {
    await prisma.session.deleteMany({ where: { id: sid } }).catch(() => {});
  }
  res.clearCookie("sid"); res.clearCookie("refresh_token");
  return res.json({ ok: true });
});

// --------------------------------------------------------------------------
// GET /auth/well-known/jwks.json
// --------------------------------------------------------------------------

authRouter.get("/auth/well-known/jwks.json", async (_req, res) => {
  const j = await getJwks();
  if (!j) return res.status(404).json({ error: "jwks_unavailable", reason: "rsa_keys_not_configured" });
  res.json(j);
});

// --------------------------------------------------------------------------
// Exported for /user/* convenience
// --------------------------------------------------------------------------
export { publicUser };