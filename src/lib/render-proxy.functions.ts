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
    // Never forward bearer tokens to the legacy takatakbackend service.
    // Production must explicitly bind to this repository's own backend.
    const baseUrl = process.env.RENDER_API_BASE_URL?.trim();
    if (!baseUrl) {
      const out: ProxyResult = {
        ok: false, status: 503, data: null,
        error: "backend_not_configured",
      };
      return out;
    }

    let url: string;
    try {
      const backend = new URL(baseUrl);
      const localDev = process.env.NODE_ENV !== "production" &&
        backend.protocol === "http:" && ["localhost", "127.0.0.1"].includes(backend.hostname);
      if (backend.protocol !== "https:" && !localDev) throw new Error("insecure_backend_url");
      // Using URL and an exact-origin check prevents accidental forwarding
      // to a different host through a crafted path.
      const target = new URL(data.path, backend.origin);
      if (target.origin !== backend.origin) throw new Error("cross_origin_path");
      url = target.toString();
    } catch {
      const out: ProxyResult = {
        ok: false, status: 503, data: null,
        error: "backend_url_invalid",
      };
      return out;
    }

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