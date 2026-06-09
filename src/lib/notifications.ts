import { apiGet, apiPost } from "./api-client";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  readAt?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export const listNotifications = () =>
  apiGet<{ notifications: Notification[]; unread: number }>("/notifications");

export const markNotificationRead = (id: string) =>
  apiPost<{ ok: true }>(`/notifications/${encodeURIComponent(id)}/read`, {});

export const markAllNotificationsRead = () =>
  apiPost<{ ok: true }>(`/notifications/read-all`, {});