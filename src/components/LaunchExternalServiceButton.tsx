import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Loader2 } from "lucide-react";
import { launchExternalService } from "@/lib/launch.functions";
import { resolvePortalUrl } from "@/lib/upmind";
import { getAuthToken } from "@/lib/auth-store";

interface Props {
  serviceKey: string;
  label: string;
  envKey?: string;
  disabled?: boolean;
  className?: string;
}

export function LaunchExternalServiceButton({
  serviceKey,
  label,
  envKey,
  disabled,
  className = "",
}: Props) {
  const launch = useServerFn(launchExternalService);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handle = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = (await launch({
        data: { serviceKey, token: getAuthToken() },
      })) as { ok: boolean; launchUrl?: string; message?: string };
      if (res.ok && res.launchUrl) {
        window.open(res.launchUrl, "_blank", "noopener,noreferrer");
      } else {
        const fallback = resolvePortalUrl(envKey);
        if (fallback) window.open(fallback, "_blank", "noopener,noreferrer");
        else
          setErr(
            res.message ??
              "This TAKATAK service portal is not configured yet. Contact support.",
          );
      }
    } catch {
      const fallback = resolvePortalUrl(envKey);
      if (fallback) window.open(fallback, "_blank", "noopener,noreferrer");
      else
        setErr(
          "This TAKATAK service portal is not configured yet. Contact support.",
        );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handle}
        disabled={disabled || busy}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-secondary/50 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ExternalLink size={14} />
        )}
        {label}
      </button>
      {err && <p className="mt-2 text-xs text-warning">{err}</p>}
    </div>
  );
}