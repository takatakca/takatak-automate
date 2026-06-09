/**
 * Notification service.
 *
 * Writes a row in the Notification table and (when an email provider is
 * configured) dispatches a matching email via services/email.ts. Never
 * exposes private billing data — `metadata` is the only freeform channel
 * and callers must filter what they put in it.
 */
import { prisma } from "../lib/prisma.js";
import { sendEmail } from "./email.js";
import { env } from "../lib/env.js";

export type NotificationType =
  | "order.paid"
  | "project.assigned"
  | "freelancer.accepted"
  | "freelancer.declined"
  | "delivery.submitted"
  | "revision.requested"
  | "project.approved"
  | "grace_period.started"
  | "payout.release_ready"
  | "dispute.opened"
  | "admin.exception";

export interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  email?: { to: string; template?: string };
}

export async function notify(input: NotifyInput) {
  const n = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
      metadata: (input.metadata ?? {}) as any,
    },
  });
  if (input.email?.to) {
    const url = input.actionUrl
      ? (env.APP_BASE_URL ? `${env.APP_BASE_URL}${input.actionUrl}` : input.actionUrl)
      : undefined;
    await sendEmail({
      to: input.email.to,
      subject: input.title,
      text: `${input.message}${url ? `\n\nOpen: ${url}` : ""}`,
      template: input.email.template ?? input.type,
    });
  }
  return n;
}

export async function listForUser(userId: string, limit = 50) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markRead(userId: string, id: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, readAt: null } });
}