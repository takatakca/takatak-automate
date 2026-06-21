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
      const res = await apiPost<{ user?: TakatakUser; token?: string }>(
        "/auth/register",
        data,
        { noAuth: true },
      );
      if (res.user) setUser(res.user);
      if (res.token) setAuthToken(res.token);
      if (typeof data.email === "string")
        setVerifyContext({ email: data.email });
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await apiPost<{ user?: TakatakUser; token?: string }>(
        "/auth/login",
        data,
        { noAuth: true },
      );
      if (res.user) setUser(res.user);
      if (res.token) setAuthToken(res.token);
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
      const res = await apiPost<{ user?: TakatakUser; token?: string }>(
        "/auth/verify-otp",
        data,
        { noAuth: true },
      );
      if (res.user) setUser(res.user);
      if (res.token) setAuthToken(res.token);
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