import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { MARKETPLACE_CATEGORIES } from "../seed/marketplaceCategories.js";

export const marketplaceRouter = Router();

marketplaceRouter.get("/marketplace/categories", (_req, res) => {
  res.json({ categories: MARKETPLACE_CATEGORIES });
});

marketplaceRouter.get("/marketplace/gigs", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const gigs = await prisma.marketplaceGig.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ gigs });
});

marketplaceRouter.get("/marketplace/gigs/:id", async (req, res) => {
  const gig = await prisma.marketplaceGig.findUnique({ where: { id: req.params.id } });
  if (!gig) return res.status(404).json({ error: "not_found" });
  res.json({ gig });
});

const ProjectBody = z.object({
  title: z.string().min(1).max(200),
  brief: z.string().min(1).max(5000),
  budgetCents: z.number().int().positive().optional(),
  category: z.string().min(1).max(64),
});

marketplaceRouter.post("/marketplace/projects", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = ProjectBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const project = await prisma.marketplaceProject.create({
    data: { ...parsed.data, userId: req.userId! },
  });
  res.json({ project });
});

marketplaceRouter.get("/marketplace/freelancers/:id", async (req, res) => {
  const profile = await prisma.freelancerProfile.findUnique({ where: { id: req.params.id } });
  if (!profile) return res.status(404).json({ error: "not_found" });
  res.json({ profile });
});
