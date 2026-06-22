import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/lib/auth-context";
import { getVerifyContext } from "@/lib/auth-store";
import { claimPromo, claimPromoBackend, getPromoState, trackPromo } from "@/lib/promotions";

export const Route = createFileRoute("/otp")({
  head: () => ({ meta: [{ title: "Verify — TAKATAK" }] }),
  component: OtpPage,
});

function OtpPage() {
  const { verifyOtp, resendCode, loading } = useAuth();
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [ctx, setCtx] = useState({ email: "", phone: "" });
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { setCtx(getVerifyContext()); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await verifyOtp({ otp: code, email: ctx.email, phone: ctx.phone });
      const pre = getPromoState();
      const hadPromo = pre.status === "pending" || pre.status === "none";
      if (hadPromo) {
        // Claim server-side (idempotent); falls back to local state on failure.
        await claimPromoBackend().catch(() => claimPromo());
        trackPromo("signup_completed_with_promo", { stage: "otp" });
      }
      nav({ to: "/dashboard" });
    } catch (e) { setErr((e as Error).message); }
  };

  return (
    <SiteShell>
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold">Verify your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code we sent{ctx.email ? ` to ${ctx.email}` : ""}.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              maxLength={6}
              required
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 rounded-md bg-input border border-border text-center text-2xl tracking-[0.5em]"
            />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button disabled={loading} className="w-full py-3 rounded-md font-semibold text-primary-foreground disabled:opacity-60" style={{ backgroundImage: "var(--gradient-hero)" }}>
              {loading ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => void resendCode({ email: ctx.email, phone: ctx.phone })}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Resend code
            </button>
          </form>
        </div>
      </div>
    </SiteShell>
  );
}