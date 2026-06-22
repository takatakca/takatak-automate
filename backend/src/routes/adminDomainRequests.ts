import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export const adminDomainRequestsRouter = Router();

adminDomainRequestsRouter.use("/admin/domain-requests", requireAuth, requireAdmin);
adminDomainRequestsRouter.use("/admin/hosting-requests", requireAuth, requireAdmin);

adminDomainRequestsRouter.get("/admin/domain-requests", async (_req, res) => {
  const requests = await prisma.$queryRaw<unknown[]>`
    SELECT * FROM "DomainRequest" ORDER BY "createdAt" DESC LIMIT 500
  `;
  res.json({ requests });
});

adminDomainRequestsRouter.get("/admin/hosting-requests", async (_req, res) => {
  const requests = await prisma.$queryRaw<unknown[]>`
    SELECT * FROM "HostingRequest" ORDER BY "createdAt" DESC LIMIT 500
  `;
  res.json({ requests });
});