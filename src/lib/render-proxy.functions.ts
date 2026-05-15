/**
 * Server-side proxy to the TAKATAK Render backend.
 *
 * The frontend never calls Render directly. The backend URL and any future
 * server-only credentials live in process.env (read inside the handler).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type ProxyMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

const ProxyInput = z.object({
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  /** Path beginning with `/` — base URL is added server-side */
  path: z.string().min(1).startsWith("/"),
  body: z.unknown().optional(),
  /** Bearer token forwarded from the browser; never logged */
  token: z.string().nullish(),
});

export interface ProxyResult {
  ok: boolean;
  status: number;
  data: JsonValue;
  error?: string;
}

export const proxyRender = createServerFn({ method: "POST" })
  .inputValidator((input) => ProxyInput.parse(input))
  .handler(async ({ data }) => {
    const baseUrl =
      process.env.RENDER_API_BASE_URL ?? "https://takatak.onrender.com";
    const url = `${baseUrl.replace(/\/$/, "")}${data.path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (data.token) headers.Authorization = `Bearer ${data.token}`;

    try {
      const res = await fetch(url, {
        method: data.method,
        headers,
        body:
          data.method === "GET" || data.body === undefined
            ? undefined
            : JSON.stringify(data.body),
      });

      const text = await res.text();
      let parsed: JsonValue = null;
      if (text.length > 0) {
        try {
          parsed = JSON.parse(text) as JsonValue;
        } catch {
          parsed = text;
        }
      }

      if (!res.ok) {
        const errMsg =
          (parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? ((parsed as { error?: string; message?: string }).error ??
              (parsed as { error?: string; message?: string }).message)
            : undefined) ??
          res.statusText ??
          "Request failed";
        const out: ProxyResult = { ok: false, status: res.status, data: parsed, error: errMsg };
        return out;
      }
      const out: ProxyResult = { ok: true, status: res.status, data: parsed };
      return out;
    } catch (err) {
      console.error("[proxyRender] network error:", err);
      const out: ProxyResult = {
        ok: false,
        status: 0,
        data: null,
        error: "Network error contacting TAKATAK backend.",
      };
      return out;
    }
  });