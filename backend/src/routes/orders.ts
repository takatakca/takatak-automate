import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const ordersRouter = Router();

const Item = z.object({
  serviceKey: z.string().min(1).max(64),
  qty: z.number().int().positive().default(1),
  options: z.record(z.string(), z.unknown()).optional(),
});
const Body = z.object({ items: z.array(Item).min(1).max(20) });

ordersRouter.post("/orders", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const orders = await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.order.create({
        data: {
          userId: req.userId!,
          serviceKey: item.serviceKey,
          meta: { qty: item.qty, options: item.options ?? {} },
        },
      }),
    ),
  );
  res.json({ orderIds: orders.map((o) => o.id) });
});
