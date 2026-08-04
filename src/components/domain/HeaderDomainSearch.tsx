import { useEffect, useRef, useState } from "react";
import { Globe2 } from "lucide-react";
import { DomainSearchOverlay } from "./DomainSearchOverlay";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * "Find my domain" header action. Opens the TAKATAK domain panel directly
 * beneath the header instead of navigating away.
 */
export function HeaderDomainSearch({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("nav.domainOpen")}
        className={
          compact
            ? "grid h-10 w-10 place-items-center rounded-md border border-border text-foreground hover:bg-secondary"
            : "group inline-flex shrink-0 items-center gap-1.5 rounded-md border border-primary/45 bg-primary/5 px-3 py-2 text-[13px] font-semibold text-foreground transition-all hover:border-primary/70 hover:bg-primary/10 whitespace-nowrap"
        }
      >
        <Globe2 size={15} className="text-primary transition-transform group-hover:scale-110" />
        {!compact && t("nav.findDomain")}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("domainPanel.title")}
            className="fixed inset-x-0 top-16 z-50 mx-auto w-full max-w-3xl px-3 animate-scale-in sm:px-4"
          >
            <DomainSearchOverlay onClose={() => { setOpen(false); buttonRef.current?.focus(); }} />
          </div>
        </>
      )}
    </>
  );
}