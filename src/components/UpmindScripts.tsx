import { useEffect, useState } from "react";
import { UPMIND_DAC_SCRIPT_URL, UPMIND_WIDGET_SCRIPT_URL } from "@/lib/upmind";

/**
 * Module-level singleton loader. Multiple `<UpmindScripts />` instances
 * (e.g. UpmindDac + UpmindHostingPlans on the same page) all share ONE
 * load promise so the DAC/widget scripts are injected exactly once.
 *
 * Fixes runtime error:
 *   NotSupportedError: Failed to execute 'define' on 'CustomElementRegistry':
 *   the name "upm-dac" has already been used with this registry
 */
type Status = "idle" | "loading" | "ready" | "error";
let status: Status = "idle";
let loadPromise: Promise<void> | null = null;
const subscribers = new Set<(s: Status) => void>();

function notify(next: Status) {
  status = next;
  for (const sub of subscribers) sub(next);
}

function injectScript(src: string, isModule = false): Promise<void> {
  return new Promise((resolve, reject) => {
    // Dedupe by URL — survives HMR and SPA navigation.
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-upmind-src="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.upmindLoaded === "1") return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`load_failed:${src}`)), { once: true });
      return;
    }
    const s = document.createElement("script");
    if (isModule) s.type = "module";
    s.src = src;
    s.async = true;
    s.dataset.upmindSrc = src;
    s.onload = () => { s.dataset.upmindLoaded = "1"; resolve(); };
    s.onerror = () => reject(new Error(`load_failed:${src}`));
    document.body.appendChild(s);
  });
}

function ensureLoaded(): Promise<void> {
  if (status === "ready") return Promise.resolve();
  if (loadPromise) return loadPromise;
  notify("loading");
  loadPromise = Promise.all([
    injectScript(UPMIND_WIDGET_SCRIPT_URL, true),
    injectScript(UPMIND_DAC_SCRIPT_URL, false),
  ])
    .then(() => { notify("ready"); })
    .catch((err) => {
      notify("error");
      // Reset so a manual refresh / remount can retry.
      loadPromise = null;
      throw err;
    });
  return loadPromise;
}

/**
 * Loads Upmind <upm-dac> + widget scripts once on the client.
 * Renders nothing — mount it inside any page that uses the widget.
 * Calls `onReady` once the scripts are usable; `onError` on hard failure.
 */
export function UpmindScripts({
  onReady,
  onError,
}: {
  onReady?: () => void;
  onError?: (err: Error) => void;
}) {
  const [, setLocal] = useState<Status>(status);

  useEffect(() => {
    let cancelled = false;
    const sub = (s: Status) => {
      if (cancelled) return;
      setLocal(s);
      if (s === "ready") onReady?.();
    };
    subscribers.add(sub);
    if (status === "ready") {
      onReady?.();
    } else {
      ensureLoaded().catch((err) => {
        if (!cancelled) onError?.(err as Error);
      });
    }
    return () => {
      cancelled = true;
      subscribers.delete(sub);
    };
  }, [onReady, onError]);

  return null;
}