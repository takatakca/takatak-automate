import { useEffect, useRef, useState } from "react";
import { UpmindScripts } from "./UpmindScripts";
import {
  UPMIND_ACCOUNT_ID,
  UPMIND_BRAND_ID,
  UPMIND_CURRENCY,
  UPMIND_DOMAIN_SEARCH_MODE,
  UPMIND_ORDER_CONFIG_URL,
} from "@/lib/upmindConfig";
import { DomainRequestFallback } from "@/components/domain/DomainRequestFallback";

/**
 * The Upmind <upm-dac> domain availability + checkout widget.
 * `clientId` is optional — pass it for an authenticated buyer flow.
 */
export function UpmindDac({ clientId }: { clientId?: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);

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
    let observer: MutationObserver | null = null;
    ref.current.innerHTML = "";
    const el = document.createElement("upm-dac");
    el.setAttribute("order-config-url", UPMIND_ORDER_CONFIG_URL);
    el.setAttribute("currency-code", UPMIND_CURRENCY);
    el.setAttribute("currency", UPMIND_CURRENCY);
    el.setAttribute("mode", UPMIND_DOMAIN_SEARCH_MODE);
    el.setAttribute("domain-search-mode", UPMIND_DOMAIN_SEARCH_MODE);
    if (UPMIND_BRAND_ID) el.setAttribute("brand-id", UPMIND_BRAND_ID);
    if (UPMIND_ACCOUNT_ID) el.setAttribute("account-id", UPMIND_ACCOUNT_ID);
    if (clientId) el.setAttribute("client-id", clientId);
    el.setAttribute("style", "display:block;width:100%;");
    ref.current.appendChild(el);

    const scanForWidgetFailure = () => {
      const text = [
        ref.current?.innerText,
        el.shadowRoot?.textContent,
      ].filter(Boolean).join(" ").toLowerCase();
      if (text.includes("oops") || text.includes("something went wrong")) {
        setWidgetError("upmind_widget_runtime_error");
        setFailed(true);
      }
    };
    const scanForBlankWidget = () => {
      const box = el.getBoundingClientRect();
      const text = ref.current?.innerText?.trim() ?? "";
      if (!text && box.height < 80) {
        setWidgetError("upmind_widget_blank_after_oauth_failure");
        setFailed(true);
      }
    };
    observer = new MutationObserver(scanForWidgetFailure);
    observer.observe(ref.current, { childList: true, subtree: true, characterData: true });
    const t = setTimeout(scanForWidgetFailure, 1500);
    const poll = setInterval(scanForWidgetFailure, 500);
    const blankTimer = setTimeout(scanForBlankWidget, 5000);
    return () => { observer?.disconnect(); clearTimeout(t); clearInterval(poll); clearTimeout(blankTimer); };
  }, [ready, clientId]);

  return (
    <>
      <UpmindScripts
        onReady={() => { setReady(true); setFailed(false); }}
        onError={() => setFailed(true)}
      />
      {!failed && <div ref={ref} className="w-full" />}
      {!ready && !failed && (
        <div className="text-center text-sm text-muted-foreground py-12">
          Loading TAKATAK domain search…
        </div>
      )}
      {failed && (
        <DomainRequestFallback diagnosticCode={widgetError ?? "upmind_widget_unavailable"} />
      )}
    </>
  );
}