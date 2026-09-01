import { useRef } from "react";
import { Check, Server } from "lucide-react";
import { pricing, formatCAD } from "@/lib/pricing";
import { useLanguage } from "@/hooks/useLanguage";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HostingEnvironmentScene } from "./HostingEnvironmentScene";
import type { DomainOwnership } from "@/lib/domainHostingSelection";

const DESC_KEYS: Record<string, string> = {
  portfolio: "hosting.plan.portfolio.desc",
  bronze: "hosting.plan.bronze.desc",
  silver: "hosting.plan.silver.desc",
  gold: "hosting.plan.gold.desc",
};

const SCALE_KEYS: Record<string, string> = {
  portfolio: "fnd.host.scale.light",
  bronze: "fnd.host.scale.business",
  silver: "fnd.host.scale.growth",
  gold: "fnd.host.scale.high",
};

const BENEFIT_KEYS: Record<string, readonly string[]> = {
  portfolio: ["fnd.host.portfolio.b1", "fnd.host.portfolio.b2", "fnd.host.portfolio.b3"],
  bronze: ["fnd.host.bronze.b1", "fnd.host.bronze.b2", "fnd.host.bronze.b3"],
  silver: ["fnd.host.silver.b1", "fnd.host.silver.b2", "fnd.host.silver.b3"],
  gold: ["fnd.host.gold.b1", "fnd.host.gold.b2", "fnd.host.gold.b3"],
};

interface Props {
  planKey: string | null;
  onSelectPlan: (key: string) => void;
  selectedDomain: string | null;
  ownership?: DomainOwnership;
  onOwnership: (value: DomainOwnership) => void;
  onFindDomain: () => void;
}

/**
 * Hosting configurator: one compact plan selector driving a single technical
 * environment. Plans come from the centralized pricing registry — no new
 * plans and no invented specifications.
 */
export function HostingConfigurator({
  planKey,
  onSelectPlan,
  selectedDomain,
  ownership,
  onOwnership,
  onFindDomain,
}: Props) {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  const tabsRef = useRef<HTMLDivElement>(null);
  const plans = pricing.hosting;
  const active = plans.find((p) => p.key === planKey) ?? null;
  const preview = active ?? plans[1];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const index = plans.findIndex((p) => p.key === (active?.key ?? plans[0].key));
    const next = e.key === "ArrowRight" ? (index + 1) % plans.length : (index - 1 + plans.length) % plans.length;
    onSelectPlan(plans[next].key);
    const buttons = tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]");
    buttons?.[next]?.focus();
  };

  return (
    <div className="relative flex h-full flex-col rounded-3xl border border-border bg-card/80 p-5 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{t("fnd.host.eyebrow")}</p>
      <h3 className="mt-2 text-lg font-bold text-foreground sm:text-xl">{t("fnd.host.title")}</h3>

      <div
        ref={tabsRef}
        role="tablist"
        aria-label={t("fnd.host.tabsAria")}
        onKeyDown={onKeyDown}
        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {plans.map((p) => {
          const isActive = p.key === active?.key;
          return (
            <button
              key={p.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              tabIndex={isActive || (!active && p.key === plans[0].key) ? 0 : -1}
              onClick={() => onSelectPlan(p.key)}
              className={`rounded-xl border p-2.5 text-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                isActive
                  ? `border-primary bg-primary/10 shadow-[var(--shadow-card)] ${reduced ? "" : "-translate-y-0.5"}`
                  : "border-border bg-background/70 hover:border-primary/50"
              }`}
            >
              <span className="flex items-center justify-center text-primary">
                <Server size={13} aria-hidden />
              </span>
              <span className="mt-1 block text-xs font-semibold text-foreground">{p.name}</span>
              <span className="block text-[11px] text-muted-foreground">
                {formatCAD(p.amount)}
                {t("cadence.monthly")}
              </span>
            </button>
          );
        })}
      </div>

      <div key={preview.key} className={reduced ? "mt-5" : "mt-5 animate-fade-in"}>
        <HostingEnvironmentScene planKey={preview.key} domain={selectedDomain} />

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{preview.name}</span>
            <span className="rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t(SCALE_KEYS[preview.key] as never)}
            </span>
          </span>
          <span className="text-lg font-bold text-foreground">
            {formatCAD(preview.amount)}
            <span className="text-xs font-medium text-muted-foreground">{t("cadence.monthly")}</span>
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t(DESC_KEYS[preview.key] as never)}</p>

        <ul className="mt-3 grid gap-1.5">
          {(BENEFIT_KEYS[preview.key] ?? []).map((k) => (
            <li key={k} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check size={14} className="shrink-0 text-primary" aria-hidden /> {t(k as never)}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onSelectPlan(preview.key)}
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {active ? t("fnd.host.ctaSelected", { plan: preview.name }) : t("fnd.host.cta", { plan: preview.name })}
        </button>
      </div>

      {active && !selectedDomain && (
        <fieldset className="mt-6 rounded-2xl border border-border bg-background/70 p-4">
          <legend className="px-1 text-sm font-semibold text-foreground">{t("fnd.host.ownQ")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={ownership === "has"}
              onClick={() => onOwnership("has")}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                ownership === "has" ? "border-primary/60 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("fnd.host.own.yes")}
            </button>
            <button
              type="button"
              onClick={() => {
                onOwnership("needs");
                onFindDomain();
              }}
              className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/15"
            >
              {t("fnd.host.own.find")}
            </button>
            <button
              type="button"
              aria-pressed={ownership === "later"}
              onClick={() => onOwnership("later")}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                ownership === "later" ? "border-primary/60 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("fnd.host.own.later")}
            </button>
          </div>
          {ownership === "has" && <p className="mt-2 text-xs text-muted-foreground">{t("fnd.host.own.ackYes")}</p>}
          {ownership === "later" && <p className="mt-2 text-xs text-muted-foreground">{t("fnd.host.own.ackLater")}</p>}
        </fieldset>
      )}
    </div>
  );
}
