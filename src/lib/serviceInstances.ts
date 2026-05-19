/**
 * Typed client for TAKATAK service instances.
 *
 * All calls go through the server-side Render proxy (see render-proxy.functions.ts).
 * The browser never talks to the Render backend directly.
 */
import { apiGet, apiPost } from "./api-client";
import type { ServiceState } from "./automationStates";

export interface ServiceInstance {
  id: string;
  userId: string;
  serviceKey: string;
  state: ServiceState;
  upmindOrderId?: string;
  upmindServiceId?: string;
  externalPortalUrl?: string;
  intakeId?: string;
  meta?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceTimelineEvent {
  id: string;
  state: ServiceState;
  label?: string;
  message?: string;
  at: string;
  actor?: "system" | "client" | "takatak";
}

export interface StartServiceInput {
  serviceKey: string;
  options?: Record<string, unknown>;
}

export interface StartServiceResult {
  instance: ServiceInstance;
  checkoutUrl?: string;
  intakeId?: string;
}

/** GET /user/services — list all service instances for the signed-in user */
export const getUserServices = () =>
  apiGet<{ services: ServiceInstance[] }>("/user/services");

/** GET /services/instances/:id */
export const getUserService = (id: string) =>
  apiGet<{ instance: ServiceInstance }>(
    `/services/instances/${encodeURIComponent(id)}`,
  );

/** POST /services/start — create a draft + return checkout / intake routing */
export const startService = (input: StartServiceInput) =>
  apiPost<StartServiceResult>("/services/start", input);

/** GET /services/:id/timeline */
export const getServiceTimeline = (id: string) =>
  apiGet<{ events: ServiceTimelineEvent[] }>(
    `/services/instances/${encodeURIComponent(id)}/timeline`,
  );

/** Filter helper used by dashboard category pages */
export function filterByServiceKeys(
  list: ServiceInstance[] | undefined,
  keys: string[],
): ServiceInstance[] {
  if (!list) return [];
  const set = new Set(keys);
  return list.filter((i) => set.has(i.serviceKey));
}