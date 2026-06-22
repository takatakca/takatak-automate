import { useEffect, useRef, useState } from "react";
import { UpmindScripts } from "./UpmindScripts";
import { UPMIND_CURRENCY, UPMIND_HOSTING_PLANS } from "@/lib/upmindConfig";
import { useAuth } from "@/lib/auth-context";
import { HostingRequestFallback } from "./HostingRequestFallback";

/**
 * Renders the four TAKATAK hosting plan cards via Upmind's <upm-widget>.
 * Plan IDs are ported from the legacy Next.js site (see `upmindConfig.ts`).
 * Widgets render anonymously when no `clientId` is available — they never
 * block the page if Upmind is unavailable.
 */
export function UpmindHostingPlans({ clientId }: { clientId?: string | null }) {
  const { user } = useAuth();
  const resolved =
    clientId ??
    (user as { upmindClientId?: string | null } | null)?.upmindClientId ??
    null;
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => { if (!ready) setFailed(true); }, 8000);
    return () => clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const root = containerRef.current;
    root.innerHTML = "";
    for (const plan of UPMIND_HOSTING_PLANS) {
      const cell = document.createElement("div");
      cell.className =
        "rounded-2xl border border-border bg-card p-2 min-h-[420px] flex flex-col";
      const w = document.createElement("upm-widget");
      w.setAttribute("as", "PlanCard");
      w.setAttribute("locale", "en");
      if (resolved) w.setAttribute("client-id", resolved);
      w.setAttribute(
        "bind",
        JSON.stringify({
          id: plan.productId,
          currencyCode: UPMIND_CURRENCY.toLowerCase(),
        }),
      );
      w.setAttribute("style", "display:block;width:100%;height:100%;");
      cell.appendChild(w);
      root.appendChild(cell);
    }
  }, [ready, resolved]);

  return (
    <div className="w-full">
      <UpmindScripts
        onReady={() => { setReady(true); setFailed(false); }}
        onError={() => setFailed(true)}
      />
      {!failed && (
        <div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        />
      )}
      {!ready && !failed && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {UPMIND_HOSTING_PLANS.map((p) => (
            <div
              key={p.key}
              className="rounded-2xl border border-border bg-card p-6 min-h-[260px] flex flex-col"
            >
              <h3 className="font-semibold text-foreground">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <p className="mt-auto text-xs text-muted-foreground">
                Loading live pricing…
              </p>
            </div>
          ))}
        </div>
      )}
      {failed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {UPMIND_HOSTING_PLANS.map((plan) => (
            <HostingRequestFallback key={plan.key} plan={plan} diagnosticCode="upmind_product_unavailable" />
          ))}
        </div>
      )}
    </div>
  );
}