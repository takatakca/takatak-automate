import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Globe2, Loader2, MessageSquare, Search, ShieldQuestion } from "lucide-react";
import { UpmindScripts } from "@/components/UpmindScripts";
import { DomainRequestFallback } from "@/components/domain/DomainRequestFallback";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCAD } from "@/lib/pricing";
import { trackEvent } from "@/lib/serviceIntent";
import {
  buildCandidates,
  detectTld,
  DOMAIN_TLDS,
  sanitizeLabel,
  saveDomainQuery,
  validateLabel,
  type SupportedDomainTld,
} from "@/lib/domainSearchState";

type Phase = "idle" | "checking" | "results" | "fallback";

const ERROR_KEYS = {
  empty: "domainPanel.error.empty",
  tooShort: "domainPanel.error.tooShort",
  invalid: "domainPanel.error.invalid",
} as const;

interface Props {
  selectedDomain: string | null;
  onSelect: (domain: string | null) => void;
  /** Set by the hosting side when the visitor asks to find a domain. */
  focusSignal?: number;
}

/**
 * Domain control center. Uses the existing managed TAKATAK domain layer for
 * readiness and the existing request fallback endpoint when live lookup is
 * unavailable. Availability and live prices are never fabricated and no
 * provider name or raw provider error is exposed.
 */
export function DomainWorkspace({ selectedDomain, onSelect, focusSignal = 0 }: Props) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState("");
  const [tld, setTld] = useState<SupportedDomainTld>("ca");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [layerReady, setLayerReady] = useState<boolean | null>(null);

  const label = useMemo(() => sanitizeLabel(raw), [raw]);
  const candidates = useMemo(() => buildCandidates(label, tld), [label, tld]);

  useEffect(() => {
    if (focusSignal > 0) inputRef.current?.focus();
  }, [focusSignal]);

  useEffect(() => {
    if (layerReady !== null) return;
    const timer = window.setTimeout(() => setLayerReady((v) => (v === null ? false : v)), 8000);
    return () => window.clearTimeout(timer);
  }, [layerReady]);

  function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const invalid = validateLabel(raw);
    if (invalid) {
      setError(t(ERROR_KEYS[invalid]));
      return;
    }
    setError(null);
    const nextTld = detectTld(raw, tld);
    setTld(nextTld);
    setPhase("checking");
    trackEvent("domain_search", { domain: `${label}.${nextTld}`, surface: "foundation" });
    window.setTimeout(() => setPhase("results"), 700);
  }

  function selectCandidate(domain: string, chosenTld: SupportedDomainTld) {
    onSelect(domain);
    saveDomainQuery({ label, tld: chosenTld, domain });
    trackEvent("domain_selected", { domain, surface: "foundation" });
  }

  const live = layerReady === true;

  return (
    <div className="relative rounded-3xl border border-border bg-card/90 p-5 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-7">
      <UpmindScripts onReady={() => setLayerReady(true)} onError={() => setLayerReady(false)} />

      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{t("fnd.dom.eyebrow")}</p>
      <h3 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">{t("fnd.dom.title")}</h3>

      {phase !== "fallback" ? (
        <>
          <form onSubmit={runSearch} className="mt-5" noValidate>
            <label htmlFor="fnd-domain" className="block text-xs font-medium text-muted-foreground">
              {t("fnd.dom.label")}
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-primary/60">
                <Globe2 size={16} className="shrink-0 text-primary" aria-hidden />
                <input
                  id="fnd-domain"
                  ref={inputRef}
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  placeholder="takatakbusiness"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "fnd-domain-error" : undefined}
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
                <span className="shrink-0 text-sm text-muted-foreground">.{tld}</span>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Search size={15} aria-hidden /> {t("fnd.dom.search")}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label={t("fnd.dom.tldAria")}>
              {DOMAIN_TLDS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTld(option)}
                  aria-pressed={tld === option}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    tld === option
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  .{option}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">
                {t("fnd.dom.from", { price: formatCAD(19.99) })}
              </span>
            </div>

            {error && (
              <p id="fnd-domain-error" className="mt-3 text-sm text-destructive">
                {error}
              </p>
            )}
          </form>

          <div aria-live="polite" className="mt-5">
            {phase === "checking" && (
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-6 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin text-primary" aria-hidden />
                {t("fnd.state.checking", { domain: `${label}.${tld}` })}
              </div>
            )}

            {phase === "results" && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{t("fnd.dom.resultsTitle")}</p>
                  <span className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    {live ? t("fnd.state.verify") : t("fnd.state.offline")}
                  </span>
                </div>

                {candidates.map((c) => {
                  const chosen = selectedDomain === c.domain;
                  return (
                    <button
                      key={c.domain}
                      type="button"
                      aria-pressed={chosen}
                      onClick={() => selectCandidate(c.domain, c.tld)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all hover:border-primary/50 ${
                        chosen ? "border-primary/60 bg-primary/5" : "border-border bg-background/70"
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                          chosen ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                        aria-hidden
                      >
                        <Check size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">{c.domain}</span>
                        <span className="block text-xs text-muted-foreground">
                          {chosen
                            ? t("fnd.state.selected")
                            : c.primary
                              ? t("fnd.dom.primary")
                              : t("fnd.dom.alternative")}
                        </span>
                      </span>
                      <span className="shrink-0 text-right text-sm font-medium text-foreground">
                        {formatCAD(c.price)}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">{t("cadence.yearly")}</span>
                      </span>
                    </button>
                  );
                })}

                <p className="flex items-start gap-2 pt-1 text-xs text-muted-foreground">
                  <ShieldQuestion size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                  {t("fnd.dom.verifyNote")}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPhase("fallback")}
                    className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-primary/15"
                  >
                    {t("fnd.dom.request")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhase("idle");
                      setRaw("");
                      onSelect(null);
                      inputRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    {t("fnd.dom.tryAnother")}
                  </button>
                  <a
                    href="#takatak-support"
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    <MessageSquare size={14} aria-hidden /> {t("fnd.dom.talk")}
                  </a>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-foreground">{t("fnd.fb.title")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("fnd.fb.body")}</p>
          </div>
          <DomainRequestFallback diagnosticCode={live ? "foundation_manual" : "foundation_layer_unavailable"} />
          <button
            type="button"
            onClick={() => setPhase("results")}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            {t("fnd.dom.tryAnother")}
          </button>
        </div>
      )}
    </div>
  );
}
