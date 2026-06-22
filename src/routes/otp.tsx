import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/lib/auth-context";
import { getVerifyContext } from "@/lib/auth-store";
import { claimPromo, claimPromoBackend, getPromoState, trackPromo } from "@/lib/promotions";

export const Route = createFileRoute("/otp")({
  head: () => ({ meta: [{ title: "Verify — TAKATAK" }] }),
  component: OtpPage,
});

const RESEND_COOLDOWN_SECONDS = 30;

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${name.length > 2 ? "•".repeat(Math.max(1, name.length - 2)) : ""}@${domain}`;
}
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return `${phone.startsWith("+") ? "+" : ""}${"•".repeat(digits.length - 4)}${digits.slice(-4)}`;
}

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid_otp") || m.includes("invalid_or_expired_otp")) return "That code doesn't match. Double-check and try again.";
  if (m.includes("otp_expired")) return "This code has expired. Request a new one.";
  if (m.includes("otp_not_requested")) return "We don't have a pending code for this account. Please request a new one.";
  if (m.includes("cooldown")) return "Please wait a few seconds before requesting another code.";
  if (m.includes("email_not_found") || m.includes("phone_not_found")) return "We couldn't find that account. Try signing up first.";
  if (m.includes("invalid_input")) return "Please enter the 6-digit code from your message.";
  return "Something went wrong. Please try again.";
}

function OtpPage() {
  const { verifyOtp, resendCode, loading } = useAuth();
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [ctx, setCtx] = useState({ email: "", phone: "" });
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [promoClaimed, setPromoClaimed] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setCtx(getVerifyContext()); }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
      return;
    }
    if (!tickRef.current) {
      tickRef.current = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    }
    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; } };
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    try {
      await verifyOtp({ otp: code, email: ctx.email, phone: ctx.phone });
      const pre = getPromoState();
      const hadPromo = pre.status === "pending" || pre.status === "none";
      if (hadPromo) {
        // Claim server-side (idempotent); falls back to local state on failure.
        await claimPromoBackend().catch(() => claimPromo());
        trackPromo("signup_completed_with_promo", { stage: "otp" });
        setPromoClaimed(true);
      }
      nav({ to: "/dashboard" });
    } catch (e) { setErr(friendlyError((e as Error).message)); }
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    setErr(null); setInfo(null);
    try {
      await resendCode({ email: ctx.email, phone: ctx.phone });
      setInfo("We sent a new verification code.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (e) { setErr(friendlyError((e as Error).message)); }
  };

  const destination = ctx.email ? maskEmail(ctx.email) : ctx.phone ? maskPhone(ctx.phone) : null;

  return (
    <SiteShell>
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold">Verify your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent your verification code{destination ? ` to ${destination}` : ""}. Enter the 6-digit code below.
          </p>
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
            {info && <p className="text-sm text-emerald-500">{info}</p>}
            {promoClaimed && (
              <p className="text-sm text-emerald-500">FIRST10 saved — 10% off your first TAKATAK service.</p>
            )}
            <button disabled={loading} className="w-full py-3 rounded-md font-semibold text-primary-foreground disabled:opacity-60" style={{ backgroundImage: "var(--gradient-hero)" }}>
              {loading ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              onClick={onResend}
              disabled={cooldown > 0}
              className="w-full text-sm text-muted-foreground hover:text-foreground disabled:opacity-60"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </form>
        </div>
      </div>
    </SiteShell>
  );
}