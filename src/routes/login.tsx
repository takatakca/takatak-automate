import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — TAKATAK" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await login({ email });
      nav({ to: "/otp" });
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <SiteShell>
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your TAKATAK account.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              type="email"
              required
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-input border border-border text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button
              disabled={loading}
              className="w-full py-3 rounded-md font-semibold text-primary-foreground disabled:opacity-60"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              {loading ? "Sending code…" : "Send sign-in code"}
            </button>
          </form>
          <p className="mt-6 text-sm text-center text-muted-foreground">
            New to TAKATAK?{" "}
            <Link to="/signup" className="text-primary">Create an account</Link>
          </p>
        </div>
      </div>
    </SiteShell>
  );
}