import { ArrowRight, Globe2, Layout, Plus, Server } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { pricing, formatCAD } from "@/lib/pricing";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/lib/auth-context";

interface Props {
  selectedDomain: string | null;
  planKey: string | null;
  websiteInterest: boolean;
  onToggleWebsite: (value: boolean) => void;
}

/**
 * Live summary of the foundation the visitor is assembling:
 * domain + hosting (+ optional website), with a single continue action.
 */
export function FoundationSummary({ selectedDomain, planKey, websiteInterest, onToggleWebsite }: Props) {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const plan = pricing.hosting.find((p) => p.key === planKey) ?? null;
  const site = pricing.websites[0];
  const ready = Boolean(selectedDomain || plan);

  const target = isAuthenticated ? "/dashboard" : "/signup";

  return (
    <div className="rounded-3xl border border-border bg-card/85 p-5 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{t("fnd.sum.title")}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2">
              <Globe2 size={14} className="text-primary" aria-hidden />
              <span className="font-medium text-foreground">{selectedDomain ?? t("fnd.sum.none")}</span>
              <span className="text-xs text-muted-foreground">
                {selectedDomain ? formatCAD(pricing.domain.register.amount) + t("cadence.yearly") : ""}
              </span>
            </span>
            <Plus size={14} className="text-muted-foreground" aria-hidden />
            <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2">
              <Server size={14} className="text-primary" aria-hidden />
              <span className="font-medium text-foreground">{plan ? plan.name : t("fnd.sum.none")}</span>
              <span className="text-xs text-muted-foreground">
                {plan ? formatCAD(plan.amount) + t("cadence.monthly") : ""}
              </span>
            </span>
            {websiteInterest && (
              <>
                <Plus size={14} className="text-muted-foreground" aria-hidden />
                <span className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2">
                  <Layout size={14} className="text-primary" aria-hidden />
                  <span className="font-medium text-foreground">{site.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("price.from")} {formatCAD(site.amount)}
                  </span>
                </span>
              </>
            )}
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {ready ? t("fnd.sum.ready") : t("fnd.sum.hint")}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <Link
            to={target}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
              ready
                ? "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:opacity-95"
                : "border border-border bg-background/70 text-muted-foreground"
            }`}
          >
            {t("fnd.cont.cta")} <ArrowRight size={15} aria-hidden />
          </Link>
          <span className="text-xs text-muted-foreground">{t("fnd.cont.note")}</span>
        </div>
      </div>

      {!websiteInterest ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background/60 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{t("fnd.web.title")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("fnd.web.body")}</p>
          </div>
          <button
            type="button"
            onClick={() => onToggleWebsite(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-foreground hover:bg-primary/15"
          >
            {t("fnd.web.add")}
          </button>
          <Link to="/services/websites" className="text-sm font-medium text-primary hover:underline">
            {t("fnd.web.only")}
          </Link>
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground">
          {t("fnd.web.added")}
        </p>
      )}
    </div>
  );
}
