import { useEffect, useRef, useState } from "react";
import { UpmindScripts } from "./UpmindScripts";
import { UPMIND_CURRENCY, UPMIND_ORDER_CONFIG_URL } from "@/lib/upmind";

/**
 * The Upmind <upm-dac> domain availability + checkout widget.
 * `clientId` is optional — pass it for an authenticated buyer flow.
 */
export function UpmindDac({ clientId }: { clientId?: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // If the scripts never become ready (e.g. blocked by network / adblock),
  // surface a friendly fallback after 8s instead of leaving a blank section.
  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => { if (!ready) setFailed(true); }, 8000);
    return () => clearTimeout(t);
  }, [ready]);

  // Re-create the element when clientId changes so the widget picks it up.
  useEffect(() => {
    if (!ready || !ref.current) return;
    ref.current.innerHTML = "";
    const el = document.createElement("upm-dac");
    el.setAttribute("order-config-url", UPMIND_ORDER_CONFIG_URL);
    el.setAttribute("currency-code", UPMIND_CURRENCY);
    if (clientId) el.setAttribute("client-id", clientId);
    el.setAttribute("style", "display:block;width:100%;");
    ref.current.appendChild(el);
  }, [ready, clientId]);

  return (
    <>
      <UpmindScripts
        onReady={() => { setReady(true); setFailed(false); }}
        onError={() => setFailed(true)}
      />
      <div ref={ref} className="w-full" />
      {!ready && !failed && (
        <div className="text-center text-sm text-muted-foreground py-12">
          Loading TAKATAK domain search…
        </div>
      )}
      {failed && (
        <div className="text-center text-sm text-muted-foreground py-12">
          Domain search is temporarily unavailable. Please refresh the page
          or{" "}
          <a href="mailto:support@takatak.ca" className="underline">
            contact TAKATAK support
          </a>
          .
        </div>
      )}
    </>
  );
}