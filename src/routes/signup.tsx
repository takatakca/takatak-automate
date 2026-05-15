import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — TAKATAK" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signup, loading } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "",
    email: "", phone: "", password: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await signup(form);
      nav({ to: "/otp" });
    } catch (e) { setErr((e as Error).message); }
  };

  return (
    <SiteShell>
      <div className="max-w-lg mx-auto px-4 py-20">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold">Start with TAKATAK</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your first step toward an automated business.</p>
          <form onSubmit={submit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required placeholder="First name" value={form.firstName} onChange={upd("firstName")} className="px-4 py-3 rounded-md bg-input border border-border text-sm" />
            <input required placeholder="Last name" value={form.lastName} onChange={upd("lastName")} className="px-4 py-3 rounded-md bg-input border border-border text-sm" />
            <input required placeholder="Username" value={form.username} onChange={upd("username")} className="sm:col-span-2 px-4 py-3 rounded-md bg-input border border-border text-sm" />
            <input required type="email" placeholder="Email" value={form.email} onChange={upd("email")} className="sm:col-span-2 px-4 py-3 rounded-md bg-input border border-border text-sm" />
            <input required placeholder="Phone" value={form.phone} onChange={upd("phone")} className="sm:col-span-2 px-4 py-3 rounded-md bg-input border border-border text-sm" />
            <input required type="password" placeholder="Password" value={form.password} onChange={upd("password")} className="sm:col-span-2 px-4 py-3 rounded-md bg-input border border-border text-sm" />
            {err && <p className="sm:col-span-2 text-sm text-destructive">{err}</p>}
            <button disabled={loading} className="sm:col-span-2 py-3 rounded-md font-semibold text-primary-foreground disabled:opacity-60" style={{ backgroundImage: "var(--gradient-hero)" }}>
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary">Sign in</Link>
          </p>
        </div>
      </div>
    </SiteShell>
  );
}