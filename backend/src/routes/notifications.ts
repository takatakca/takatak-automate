import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { listForUser, markRead, markAllRead, unreadCount } from "../services/notifications.js";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get("/notifications", async (req: AuthedRequest, res) => {
  const [items, unread] = await Promise.all([
    listForUser(req.userId!),
    unreadCount(req.userId!),
  ]);
  res.json({ notifications: items, unread });
});

notificationsRouter.post("/notifications/:id/read", async (req: AuthedRequest, res) => {
  await markRead(req.userId!, req.params.id);
  res.json({ ok: true });
});

notificationsRouter.post("/notifications/read-all", async (req: AuthedRequest, res) => {
  await markAllRead(req.userId!);
  res.json({ ok: true });
});