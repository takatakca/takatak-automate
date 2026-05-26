import { apiGet, apiPost } from "./api-client";
import type { PaymentReleaseState } from "./marketplace";

export interface FreelancerProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  skills: string[];
  rating?: number;
  status?: "pending" | "approved" | "rejected";
}

export interface FreelancerContract {
  id: string;
  projectId: string;
  projectTitle: string;
  status: "assigned" | "accepted" | "declined" | "in_progress" | "submitted" | "completed";
  paymentState: PaymentReleaseState;
  amountCents: number;
  currency: string;
}

export interface PayoutRow {
  id: string;
  contractId: string;
  status: "held" | "scheduled" | "released" | "disputed";
  amountCents: number;
  currency: string;
  releasedAt?: string;
}

export const applyFreelancer = (body: { displayName: string; bio?: string; skills: string[] }) =>
  apiPost<{ application: { id: string; status: string } }>("/freelancers/apply", body);

export const getMyFreelancerProfile = () =>
  apiGet<{ profile: FreelancerProfile | null }>("/freelancers/me");

export const listContracts = () =>
  apiGet<{ contracts: FreelancerContract[] }>("/freelancers/contracts");

export const getContract = (id: string) =>
  apiGet<{ contract: FreelancerContract }>(`/freelancers/contracts/${encodeURIComponent(id)}`);

export const acceptContract = (id: string) =>
  apiPost<{ ok: true }>(`/freelancers/contracts/${encodeURIComponent(id)}/accept`, {});

export const declineContract = (id: string, reason?: string) =>
  apiPost<{ ok: true }>(`/freelancers/contracts/${encodeURIComponent(id)}/decline`, { reason });

export const listPayouts = () =>
  apiGet<{ payouts: PayoutRow[] }>("/freelancers/payouts");