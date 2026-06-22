/**
 * Upmind integration — ported from legacy services/upmindService.js.
 *
 * Safe-by-default: if UPMIND_API_KEY is not configured, every call returns
 * a benign empty/unavailable result so the dashboard keeps loading.
 * ensureUpmindClient never throws; failures mark `upmindRetryNeeded`.
 */
import axios, { type AxiosInstance } from "axios";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import type { User } from "@prisma/client";

const UP_API = "https://api.upmind.io/api";

let client: AxiosInstance | null = null;
function getClient(): AxiosInstance | null {
  if (!env.UPMIND_API_KEY) return null;
  if (!client) {
    client = axios.create({
      baseURL: UP_API,
      headers: { Authorization: `Bearer ${env.UPMIND_API_KEY}`, "Content-Type": "application/json" },
      timeout: 10_000,
    });
  }
  return client;
}

export function isUpmindConfigured(): boolean {
  return Boolean(env.UPMIND_API_KEY);
}

export interface UpmindOrder { id: string; product: string; domain: string | null; status: string; createdAt: string; nextDue: string | null }
export interface UpmindInvoice { id: string; number: string; status: string; amount: number; issuedAt: string; dueAt: string; items: string[] }
export interface UpmindTicket { id: string; subject: string; status: string; lastReplyAt: string | null }

export async function getOrders(clientId: string): Promise<UpmindOrder[]> {
  const c = getClient();
  if (!c || !clientId) return [];
  try {
    const res = await c.get(`/admin/clients/${clientId}/orders`);
    return (res.data?.data ?? []).map((o: any) => ({
      id: o.id,
      product: o.product?.name ?? "Unknown product",
      domain: o.domain?.name ?? null,
      status: o.status,
      createdAt: o.created_at,
      nextDue: o.next_due_date ?? null,
    }));
  } catch (err) {
    console.warn("[upmind] getOrders failed", (err as Error).message);
    return [];
  }
}

export async function getInvoices(clientId: string): Promise<UpmindInvoice[]> {
  const c = getClient();
  if (!c || !clientId) return [];
  try {
    const res = await c.get(`/admin/clients/${clientId}/invoices`);
    return (res.data?.data ?? []).map((i: any) => ({
      id: i.id,
      number: i.number,
      status: i.status,
      amount: i.total,
      issuedAt: i.issued_at,
      dueAt: i.due_at,
      items: (i.items ?? []).map((x: any) => x.description),
    }));
  } catch (err) {
    console.warn("[upmind] getInvoices failed", (err as Error).message);
    return [];
  }
}

export async function getTickets(clientId: string): Promise<UpmindTicket[]> {
  const c = getClient();
  if (!c || !clientId) return [];
  try {
    const res = await c.get(`/admin/clients/${clientId}/tickets`);
    return (res.data?.data ?? []).map((t: any) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      lastReplyAt: t.last_reply_at ?? null,
    }));
  } catch (err) {
    console.warn("[upmind] getTickets failed", (err as Error).message);
    return [];
  }
}

async function createClientInUpmind(user: User): Promise<string | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const res = await c.post("/admin/clients", {
      brand_id: env.UPMIND_BRAND_ID,
      email: user.email,
      login_enabled: true,
      firstname: user.firstName ?? "",
      lastname: user.lastName ?? "",
      phone: user.phone ?? "",
    });
    return res.data?.id ?? res.data?.data?.id ?? null;
  } catch (err) {
    console.warn("[upmind] createClient failed", (err as any)?.response?.data ?? (err as Error).message);
    return null;
  }
}

/** Idempotent. Never throws. Marks `upmindRetryNeeded` on failure. */
export async function ensureUpmindClient(user: User): Promise<User> {
  if (user.upmindClientId) return user;
  if (!isUpmindConfigured()) return user;
  const c = getClient();
  if (!c) return user;
  try {
    // 1) Try to find an existing client by email/phone.
    const search = await c.get("/admin/clients", { params: { search: user.email || user.phone || "" } });
    const existing = search.data?.data?.[0];
    if (existing?.id) {
      return prisma.user.update({
        where: { id: user.id },
        data: { upmindClientId: existing.id, upmindRetryNeeded: false },
      });
    }
    // 2) Otherwise create.
    const newId = await createClientInUpmind(user);
    if (newId) {
      return prisma.user.update({
        where: { id: user.id },
        data: { upmindClientId: newId, upmindRetryNeeded: false, encryptedPassword: null },
      });
    }
    return prisma.user.update({ where: { id: user.id }, data: { upmindRetryNeeded: true } });
  } catch (err) {
    console.warn("[upmind] ensureUpmindClient failed", (err as Error).message);
    return prisma.user.update({ where: { id: user.id }, data: { upmindRetryNeeded: true } });
  }
}