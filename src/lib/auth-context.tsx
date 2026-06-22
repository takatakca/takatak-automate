import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { apiPost, apiGet } from "./api-client";
import { getAuthToken, setAuthToken, setVerifyContext } from "./auth-store";
import { fetchUpmindClientId } from "./legacyAuthAdapter";

export interface TakatakUser {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  upmindClientId?: string | null;
}

/** Raw backend response shape across /auth/* and /user/dashboard endpoints. */
interface AuthResponseShape {
  message?: string;
  token?: string;
  accessToken?: string;
  sid?: string;
  user?: TakatakUser;
  userId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  upmindClientId?: string | null;
  promotion?: unknown;
}

/**
 * Backend returns flat fields (userId, email, phone, upmindClientId) on some
 * endpoints and a nested `user` on others. Normalize to a TakatakUser.
 */
function normalizeUser(res: AuthResponseShape, fallback?: Record<string, unknown>): TakatakUser | null {
  if (res.user && typeof res.user === "object") return res.user;
  const id = res.userId;
  const email = res.email ?? (typeof fallback?.email === "string" ? (fallback.email as string) : undefined);
  const phone = res.phone ?? (typeof fallback?.phone === "string" ? (fallback.phone as string) : undefined);
  if (!id && !email && !phone) return null;
  return {
    id,
    email,
    phone,
    firstName: res.firstName ?? (typeof fallback?.firstName === "string" ? (fallback.firstName as string) : undefined),
    lastName: res.lastName ?? (typeof fallback?.lastName === "string" ? (fallback.lastName as string) : undefined),
    username: res.username ?? (typeof fallback?.username === "string" ? (fallback.username as string) : undefined),
    upmindClientId: res.upmindClientId ?? null,
  };
}

function tokenFrom(res: AuthResponseShape): string | null {
  return res.token ?? res.accessToken ?? null;
}

interface DashboardData {
  user: TakatakUser | null;
  orders: unknown[];
  invoices: unknown[];
  activity: unknown[];
  summary: {
    totalOrders: number;
    totalInvoices: number;
    unpaidInvoices: number;
    activeTickets: number;
  };
}

interface AuthContextValue extends DashboardData {
  loading: boolean;
  isAuthenticated: boolean;
  signup: (data: Record<string, unknown>) => Promise<unknown>;
  login: (data: Record<string, unknown>) => Promise<unknown>;
  verifyOtp: (data: Record<string, unknown>) => Promise<unknown>;
  resendCode: (data: Record<string, unknown>) => Promise<unknown>;
  logout: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

const emptySummary = {
  totalOrders: 0,
  totalInvoices: 0,
  unpaidInvoices: 0,
  activeTickets: 0,
};

const AuthContext = createContext<AuthContextValue | null>(null);

const INACTIVITY_LIMIT = 10 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<TakatakUser | null>(null);
  const [orders, setOrders] = useState<unknown[]>([]);
  const [invoices, setInvoices] = useState<unknown[]>([]);
  const [activity, setActivity] = useState<unknown[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Inactivity auto-logout
  useEffect(() => {
    if (!hydrated) return;
    let timeout: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (getAuthToken()) {
          setAuthToken(null);
          setUser(null);
          navigate({ to: "/login" });
        }
      }, INACTIVITY_LIMIT);
    };
    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(timeout);
    };
  }, [hydrated, navigate]);

  const signup = useCallback(async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await apiPost<AuthResponseShape>(
        "/auth/register",
        data,
        { noAuth: true },
      );
      const u = normalizeUser(res, data);
      if (u) setUser(u);
      const tk = tokenFrom(res);
      if (tk) setAuthToken(tk);
      if (typeof data.email === "string")
        setVerifyContext({ email: data.email });
      if (typeof data.phone === "string")
        setVerifyContext({ phone: data.phone });
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await apiPost<AuthResponseShape>(
        "/auth/login",
        data,
        { noAuth: true },
      );
      const u = normalizeUser(res, data);
      if (u) setUser(u);
      const tk = tokenFrom(res);
      if (tk) setAuthToken(tk);
      if (typeof data.email === "string")
        setVerifyContext({ email: data.email });
      if (typeof data.phone === "string")
        setVerifyContext({ phone: data.phone });
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await apiPost<AuthResponseShape>(
        "/auth/verify-otp",
        data,
        { noAuth: true },
      );
      const u = normalizeUser(res, data);
      if (u) setUser(u);
      const tk = tokenFrom(res);
      if (tk) setAuthToken(tk);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const resendCode = useCallback(async (data: Record<string, unknown>) => {
    return apiPost("/auth/resend-code", data, { noAuth: true });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout", {});
    } catch {
      /* ignore */
    }
    setAuthToken(null);
    setUser(null);
    setOrders([]);
    setInvoices([]);
    setActivity([]);
    setSummary(emptySummary);
    navigate({ to: "/login" });
  }, [navigate]);

  const refreshDashboard = useCallback(async () => {
    if (!getAuthToken()) return;
    setLoading(true);
    try {
      const data = await apiGet<DashboardData>("/user/dashboard");
      if (data.user) setUser(data.user);
      setOrders(data.orders ?? []);
      setInvoices(data.invoices ?? []);
      setActivity(data.activity ?? []);
      const inv = data.invoices ?? [];
      const act = data.activity ?? [];
      setSummary({
        totalOrders: (data.orders ?? []).length,
        totalInvoices: inv.length,
        unpaidInvoices: inv.filter(
          (i): i is { status: string } =>
            !!i &&
            typeof i === "object" &&
            (i as { status?: string }).status === "unpaid",
        ).length,
        activeTickets: act.filter(
          (a): a is { type: string; status: string } =>
            !!a &&
            typeof a === "object" &&
            (a as { type?: string }).type === "ticket" &&
            (a as { status?: string }).status === "open",
        ).length,
      });
      // Auxiliary: hydrate Upmind client ID. Failures are swallowed —
      // auth and Upmind are independent so widgets stay anonymous on error.
      try {
        const upmindClientId = await fetchUpmindClientId();
        if (upmindClientId) {
          setUser((u) => ({ ...(u ?? {}), upmindClientId }));
        }
      } catch {
        /* never block dashboard on Upmind */
      }
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      orders,
      invoices,
      activity,
      summary,
      loading,
      isAuthenticated: hydrated && !!getAuthToken(),
      signup,
      login,
      verifyOtp,
      resendCode,
      logout,
      refreshDashboard,
    }),
    [user, orders, invoices, activity, summary, loading, hydrated, signup, login, verifyOtp, resendCode, logout, refreshDashboard],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}