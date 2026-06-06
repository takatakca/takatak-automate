import { apiGet, apiPost } from "./api-client";
import type { ClientProject, PaymentReleaseState } from "./marketplace";

export type AdminProjectFilter =
  | "all" | "awaiting_assignment" | "assigned" | "submitted" | "grace_period" | "disputed" | "release_ready";

export interface AdminProjectRow extends ClientProject {
  contracts: { id: string; freelancerId: string; status: string; paymentState: PaymentReleaseState; amountCents: number; currency: string }[];
}

export const listAdminProjects = (filter: AdminProjectFilter = "all") =>
  apiGet<{ projects: AdminProjectRow[] }>(`/admin/projects?filter=${encodeURIComponent(filter)}`);

export const getAdminProject = (id: string) =>
  apiGet<{ project: AdminProjectRow & { audits: { id: string; actor: string; action: string; data: unknown; at: string }[] } }>(
    `/admin/projects/${encodeURIComponent(id)}`,
  );

export const adminAssign = (id: string, body: { freelancerId: string; amountCents: number; currency?: string; note?: string }) =>
  apiPost<{ contract: { id: string } }>(`/admin/projects/${encodeURIComponent(id)}/assign`, body);

export const adminRequestRevision = (id: string, note: string) =>
  apiPost<{ ok: true }>(`/admin/projects/${encodeURIComponent(id)}/request-revision`, { note });

export const adminApproveDelivery = (id: string) =>
  apiPost<{ ok: true }>(`/admin/projects/${encodeURIComponent(id)}/approve-delivery`, {});

export const adminStartGracePeriod = (id: string) =>
  apiPost<{ ok: true; holdUntil?: string }>(`/admin/projects/${encodeURIComponent(id)}/start-grace-period`, {});

export const adminReleasePayment = (id: string, force = false) =>
  apiPost<{ ok: boolean; released?: { contractId: string; reference: string }[]; provider?: string; reason?: string }>(
    `/admin/projects/${encodeURIComponent(id)}/release-payment`,
    { force },
  );

export const adminDispute = (id: string, reason: string) =>
  apiPost<{ ok: true }>(`/admin/projects/${encodeURIComponent(id)}/dispute`, { reason });

export const adminSweepPayouts = () =>
  apiPost<{ ok: true; released: { projectId: string; released: number }[] }>(`/admin/payouts/sweep`, {});