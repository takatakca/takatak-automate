import { useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiPost } from "@/lib/api-client";
import type { UpmindHostingPlan } from "@/lib/upmindConfig";

/**
 * Shown when Upmind returns 404 / unauthorized for a hosting product.
 * Captures the lead via POST /hosting-requests and falls back to localStorage
 * if the backend is unreachable. Never sends customers to a broken checkout.
 */
export function HostingRequestFallback({ plan, diagnosticCode }: { plan: UpmindHostingPlan; diagnosticCode?: string }) {
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState(user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!isAuthenticated && !email && !phone) {
      setError("Add an email or phone so TAKATAK can contact you.");
      return;
    }
    setStatus("submitting");
    const payload = {
      planId: plan.productId,
      planName: plan.name,
      contactName: name || "TAKATAK customer",
      contactEmail: email || undefined,
      contactPhone: phone || undefined,
      notes: notes || undefined,
      source: diagnosticCode ? `upmind_fallback:${diagnosticCode}` : "upmind_fallback",
    };
    try {
      await Promise.race([
        apiPost("/hosting-requests", payload),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3500)),
      ]);
    } catch {
      try {
        const key = "takatak:hosting-requests";
        const prev = JSON.parse(window.localStorage.getItem(key) ?? "[]");
        window.localStorage.setItem(key, JSON.stringify([{ ...payload, createdAt: new Date().toISOString(), localOnly: true }, ...prev].slice(0, 20)));
      } catch { /* noop */ }
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="text-primary mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-foreground">Hosting request received</p>
            <p className="mt-1 text-sm text-muted-foreground">TAKATAK will reach out about your {plan.name} plan shortly.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
          <AlertTriangle size={16} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{plan.name} — request this plan</p>
          <p className="mt-1 text-sm text-muted-foreground">Checkout is temporarily unavailable. TAKATAK can provision it for you.</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        {!isAuthenticated && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
        )}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know? (optional)" rows={2} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button disabled={status === "submitting"} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {status === "submitting" ? "Sending…" : "Request this hosting plan"} <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
}