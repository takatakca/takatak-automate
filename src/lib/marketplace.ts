import { apiGet, apiPost } from "./api-client";

export type PaymentReleaseState =
  | "unpaid" | "paid_to_takatak" | "assigned" | "accepted_by_freelancer"
  | "in_progress" | "submitted" | "revision_requested" | "approved"
  | "grace_period" | "release_ready" | "released" | "disputed" | "cancelled" | "refunded";

export type ProjectStatus =
  | "draft" | "submitted" | "quoted" | "active" | "delivered" | "completed" | "cancelled";

export interface MarketplacePackage {
  id: string;
  title: string;
  category: string;
  description: string;
  priceCents: number;
  currency: string;
  freelancerId?: string | null;
}

export interface ClientProject {
  id: string;
  userId: string;
  title: string;
  brief: string;
  category: string;
  budgetCents?: number | null;
  status: ProjectStatus;
  paymentState: PaymentReleaseState;
  createdAt: string;
}

export interface ProjectMessage { id: string; from: string; body: string; at: string }
export interface ProjectFile { id: string; name: string; url: string; size?: number; uploadedAt: string }
export interface ProjectMilestone { id: string; title: string; status: string; amountCents?: number }
export interface ProjectDelivery { id: string; note?: string; files: ProjectFile[]; submittedAt: string }

export const getCategories = () => apiGet<{ categories: { slug: string; name: string }[] }>("/marketplace/categories");
export const getPackages = (category?: string) =>
  apiGet<{ packages: MarketplacePackage[] }>(`/marketplace/packages${category ? `?category=${encodeURIComponent(category)}` : ""}`);
export const getPackage = (id: string) =>
  apiGet<{ package: MarketplacePackage }>(`/marketplace/packages/${encodeURIComponent(id)}`);

export const listProjects = () => apiGet<{ projects: ClientProject[] }>("/marketplace/projects");
export const getProject = (id: string) =>
  apiGet<{
    project: ClientProject;
    messages: ProjectMessage[];
    files: ProjectFile[];
    milestones: ProjectMilestone[];
    deliveries: ProjectDelivery[];
  }>(`/marketplace/projects/${encodeURIComponent(id)}`);

export const createProject = (body: {
  title: string; brief: string; category: string; budgetCents?: number;
}) => apiPost<{ project: ClientProject }>("/marketplace/projects", body);

export const postMessage = (id: string, body: string) =>
  apiPost<{ message: ProjectMessage }>(`/marketplace/projects/${encodeURIComponent(id)}/messages`, { body });

export const approveDelivery = (id: string) =>
  apiPost<{ ok: true }>(`/marketplace/projects/${encodeURIComponent(id)}/approve`, {});

export const requestRevision = (id: string, note: string) =>
  apiPost<{ ok: true }>(`/marketplace/projects/${encodeURIComponent(id)}/request-revision`, { note });

export const openDispute = (id: string, reason: string) =>
  apiPost<{ ok: true }>(`/marketplace/projects/${encodeURIComponent(id)}/dispute`, { reason });

export function paymentReleaseLabel(s: PaymentReleaseState): string {
  const m: Record<PaymentReleaseState, string> = {
    unpaid: "Unpaid",
    paid_to_takatak: "Paid (held by TAKATAK)",
    assigned: "Assigned to freelancer",
    accepted_by_freelancer: "Accepted",
    in_progress: "In progress",
    submitted: "Submitted for review",
    revision_requested: "Revision requested",
    approved: "Approved",
    grace_period: "Grace period",
    release_ready: "Release ready",
    released: "Released to freelancer",
    disputed: "In dispute",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return m[s];
}