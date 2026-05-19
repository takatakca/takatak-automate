import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { startService } from "@/lib/serviceInstances";
import { getAuthToken } from "@/lib/auth-store";

interface Props {
  serviceKey: string;
  label: string;
  /** Where to send the user after a successful start (defaults to /dashboard) */
  fallbackTo?: string;
}

/**
 * Calls POST /services/start, then routes the user based on the backend's
 * response: external checkout URL > intake wizard > dashboard.
 */
export function StartServiceButton({
  serviceKey,
  label,
  fallbackTo = "/dashboard",
}: Props) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onClick = async () => {
    if (!getAuthToken()) {
      void navigate({ to: "/login" });
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await startService({ serviceKey });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      void navigate({ to: fallbackTo });
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : "Could not start this service right now. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={busy}
        className="px-6 py-3 rounded-lg font-semibold text-primary-foreground inline-flex items-center gap-2 disabled:opacity-60"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : null}
        {label} <ArrowRight size={16} />
      </button>
      {err && <p className="mt-2 text-xs text-warning">{err}</p>}
    </div>
  );
}