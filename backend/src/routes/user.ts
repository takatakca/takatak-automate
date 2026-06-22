/**
 * Authenticated user endpoints — dashboard + Upmind session.
 *
 * GET /user/dashboard       — merged user + marketplace + Upmind snapshot
 * GET /user/upmindClientId  — short-lived Upmind session token (5m)
 */
import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import {
  ensureUpmindClient,
  getOrders, getInvoices, getTickets,
  isUpmindConfigured,
} from "../services/upmind.js";
import { publicUser } from "./auth.js";

export const userRouter = Router();

userRouter.get("/user/dashboard", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "user_not_found" });

  // Best-effort: try once to get an Upmind client id if missing.
  if (!user.upmindClientId && isUpmindConfigured()) {
    user = await ensureUpmindClient(user);
  }

  let upmindStatus: "ok" | "unavailable" | "not_configured" | "pending" = "not_configured";
  let orders: unknown[] = [];
  let invoices: any[] = [];
  let tickets: any[] = [];

  if (!isUpmindConfigured()) {
    upmindStatus = "not_configured";
  } else if (!user.upmindClientId) {
    upmindStatus = "pending";
  } else {
    try {
      [orders, invoices, tickets] = await Promise.all([
        getOrders(user.upmindClientId),
        getInvoices(user.upmindClientId),
        getTickets(user.upmindClientId),
      ]);
      upmindStatus = "ok";
    } catch {
      upmindStatus = "unavailable";
    }
  }

  const [serviceInstances, marketplaceProjects, notifications, promotions] = await Promise.all([
    prisma.serviceInstance.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 50 }),
    prisma.clientProject.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 50 }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.promotion.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  const summary = {
    totalOrders: orders.length,
    totalInvoices: invoices.length,
    unpaidInvoices: invoices.filter((i) => i.status === "unpaid").length,
    activeTickets: tickets.filter((t) => t.status && t.status !== "closed").length,
    activeServiceInstances: serviceInstances.filter((s) => s.state !== "cancelled" && s.state !== "completed").length,
    openProjects: marketplaceProjects.filter((p) => p.status !== "completed" && p.status !== "cancelled").length,
    unreadNotifications: notifications.filter((n) => !n.readAt).length,
  };

  return res.json({
    user: publicUser(user),
    summary,
    orders,
    invoices,
    tickets,
    activity: { lastAction: user.lastAction, lastActionAt: user.lastActionAt },
    serviceInstances,
    marketplaceProjects,
    notifications,
    promotions,
    upmindStatus,
  });
});

userRouter.get("/user/upmindClientId", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  try {
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "user_not_found" });
    if (!user.upmindClientId && isUpmindConfigured()) {
      user = await ensureUpmindClient(user);
    }
    if (!user.upmindClientId) {
      // Never log the user out — return a soft empty.
      return res.json({ upmindClientId: null, upmindToken: null, status: isUpmindConfigured() ? "pending" : "not_configured" });
    }
    if (!env.UPMIND_SESSION_SECRET) {
      // Still return the id so legacy frontend renders the widget directly.
      return res.json({ upmindClientId: user.upmindClientId, upmindToken: null, status: "ok" });
    }
    const token = jwt.sign(
      { upmindId: user.upmindClientId, sub: user.id },
      env.UPMIND_SESSION_SECRET,
      { expiresIn: "5m" },
    );
    return res.json({ upmindClientId: user.upmindClientId, upmindToken: token, status: "ok" });
  } catch (err) {
    console.warn("[user/upmindClientId] error", (err as Error).message);
    // Soft fail — never break the dashboard.
    return res.json({ upmindClientId: null, upmindToken: null, status: "unavailable" });
  }
});