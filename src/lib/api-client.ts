/**
 * TAKATAK API client.
 *
 * The browser NEVER calls the Render backend directly. Every call goes through
 * a TanStack `createServerFn` (see `render-proxy.functions.ts`). The server
 * forwards the user's bearer token from sessionStorage and hides the backend
 * URL + future server-only credentials.
 */
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getAuthToken } from "./auth-store";
import {
  proxyRender,
  type ProxyMethod,
  type ProxyResult,
} from "./render-proxy.functions";

export interface ApiOptions {
  /** Override or omit auth token (e.g. for register/login) */
  token?: string | null;
  /** Skip sending the auth token even if one exists */
  noAuth?: boolean;
}

function resolveToken(opts?: ApiOptions): string | null {
  if (opts?.noAuth) return null;
  if (opts?.token !== undefined) return opts.token;
  return getAuthToken();
}

export async function apiRequest<T = unknown>(
  method: ProxyMethod,
  path: string,
  body?: unknown,
  opts?: ApiOptions,
): Promise<T> {
  const token = resolveToken(opts);
  const result = (await proxyRender({
    data: { method, path, body, token },
  })) as ProxyResult;
  if (!result.ok) {
    const err = new Error(result.error || `Request failed (${result.status})`);
    (err as Error & { status?: number; data?: unknown }).status = result.status;
    (err as Error & { status?: number; data?: unknown }).data = result.data;
    throw err;
  }
  return result.data as T;
}

export const apiGet = <T = unknown>(path: string, opts?: ApiOptions) =>
  apiRequest<T>("GET", path, undefined, opts);
export const apiPost = <T = unknown>(path: string, body?: unknown, opts?: ApiOptions) =>
  apiRequest<T>("POST", path, body, opts);
export const apiPut = <T = unknown>(path: string, body?: unknown, opts?: ApiOptions) =>
  apiRequest<T>("PUT", path, body, opts);
export const apiDelete = <T = unknown>(path: string, opts?: ApiOptions) =>
  apiRequest<T>("DELETE", path, undefined, opts);

/* React hooks ------------------------------------------------------------- */

export function useApiQuery<T>(
  key: readonly unknown[],
  path: string,
  options?: Omit<UseQueryOptions<T, Error, T, readonly unknown[]>, "queryKey" | "queryFn">,
) {
  return useQuery<T, Error, T, readonly unknown[]>({
    queryKey: key,
    queryFn: () => apiGet<T>(path),
    ...options,
  });
}

export function useApiMutation<TVariables, TData = unknown>(
  method: Exclude<ProxyMethod, "GET">,
  path: string | ((vars: TVariables) => string),
  opts?: ApiOptions,
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (vars) => {
      const resolved = typeof path === "function" ? path(vars) : path;
      return apiRequest<TData>(method, resolved, vars, opts);
    },
  });
}

/** Convenience to obtain a server-fn caller bound to React. */
export function useProxyRender() {
  return useServerFn(proxyRender);
}