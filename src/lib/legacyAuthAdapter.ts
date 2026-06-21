/**
 * Legacy auth adapter.
 *
 * Bridges the legacy TAKATAK Next.js auth surface (Render backend) into the
 * new TanStack site without re-implementing the auth flow. The full flow
 * (register/login/verify-otp/resend/logout/dashboard) lives in
 * `auth-context.tsx`; this file owns the auxiliary `GET /user/upmindClientId`
 * call so Upmind widgets can render in authenticated mode.
 *
 * Rules:
 *  - Never throws into the auth flow: a failed Upmind lookup must not log
 *    the user out or block the dashboard.
 *  - Browser never sees the backend URL — all calls go through the server
 *    proxy (`render-proxy.functions.ts`).
 *  - `sessionStorage` token key remains `authToken` for legacy compatibility.
 */
import { apiGet } from "./api-client";

/** Legacy response shape: `{ upmindClientId: string }` or a raw JWT-ish token. */
interface UpmindClientIdResponse {
  upmindClientId?: string | null;
  clientId?: string | null;
  token?: string | null;
}

function decodeJwtSub(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { sub?: unknown; client_id?: unknown };
    const sub = payload.sub ?? payload.client_id;
    return typeof sub === "string" && sub.length > 0 ? sub : null;
  } catch {
    return null;
  }
}

/**
 * Fetch the current user's Upmind client ID, or null if unavailable.
 * Swallows all errors so auth state is never affected by Upmind outages.
 */
export async function fetchUpmindClientId(): Promise<string | null> {
  try {
    const res = await apiGet<UpmindClientIdResponse | string>(
      "/user/upmindClientId",
    );
    if (typeof res === "string") {
      return res.includes(".") ? decodeJwtSub(res) : res;
    }
    if (res?.upmindClientId) return res.upmindClientId;
    if (res?.clientId) return res.clientId;
    if (res?.token) return decodeJwtSub(res.token);
    return null;
  } catch {
    return null;
  }
}