import { useEffect, useState } from "react";
import { UPMIND_DAC_SCRIPT_URL, UPMIND_WIDGET_SCRIPT_URL } from "@/lib/upmind";

let loaded = false;

/**
 * Loads Upmind <upm-dac> + widget scripts once on the client.
 * Renders nothing — mount it inside any page that uses the widget.
 */
export function UpmindScripts({ onReady }: { onReady?: () => void }) {
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    if (loaded) {
      setReady(true);
      onReady?.();
      return;
    }
    const widget = document.createElement("script");
    widget.type = "module";
    widget.src = UPMIND_WIDGET_SCRIPT_URL;
    widget.async = true;
    const dac = document.createElement("script");
    dac.src = UPMIND_DAC_SCRIPT_URL;
    dac.async = true;
    let count = 0;
    const done = () => {
      count += 1;
      if (count === 2) {
        loaded = true;
        setReady(true);
        onReady?.();
      }
    };
    widget.onload = done;
    dac.onload = done;
    document.body.appendChild(widget);
    document.body.appendChild(dac);
    return () => {
      /* keep cached for SPA nav */
    };
  }, [onReady]);

  return ready ? null : null;
}