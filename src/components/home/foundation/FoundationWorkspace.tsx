import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { FoundationBackdrop } from "./FoundationBackdrop";
import { FoundationFlow } from "./FoundationFlow";
import { DomainWorkspace } from "./DomainWorkspace";
import { HostingConfigurator } from "./HostingConfigurator";
import { FoundationSummary } from "./FoundationSummary";
import { readSelection, writeSelection, type DomainOwnership } from "@/lib/domainHostingSelection";

/**
 * TAKATAK Foundation Workspace — the domain + hosting section rebuilt as one
 * connected product environment: search a domain, shape the hosting
 * environment, and see the foundation assemble before committing.
 */
export function FoundationWorkspace() {
  const { t } = useLanguage();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [planKey, setPlanKey] = useState<string | null>(null);
  const [ownership, setOwnership] = useState<DomainOwnership | undefined>(undefined);
  const [websiteInterest, setWebsiteInterest] = useState(false);
  const [focusSignal, setFocusSignal] = useState(0);

  useEffect(() => {
    const stored = readSelection();
    if (!stored) return;
    if (stored.selectedDomain) setSelectedDomain(stored.selectedDomain);
    if (stored.hostingPlan) setPlanKey(stored.hostingPlan);
    if (stored.ownership) setOwnership(stored.ownership);
  }, []);

  const reached = websiteInterest ? 5 : planKey ? 4 : selectedDomain ? 2 : 0;

  return (
    <section className="relative overflow-hidden border-y border-border tk-mesh-light tk-mesh-alt">
      <FoundationBackdrop />
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">{t("fnd.eyebrow")}</p>
        <h2 className="mt-2 max-w-2xl text-2xl font-bold leading-tight text-foreground md:text-4xl">
          {t("fnd.title")}
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">{t("fnd.subtitle")}</p>

        <div className="mt-7">
          <FoundationFlow reached={reached} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <DomainWorkspace
            selectedDomain={selectedDomain}
            focusSignal={focusSignal}
            onSelect={(domain) => {
              setSelectedDomain(domain);
              writeSelection({ selectedDomain: domain ?? undefined });
            }}
          />
          <HostingConfigurator
            planKey={planKey}
            selectedDomain={selectedDomain}
            ownership={ownership}
            onOwnership={(value) => {
              setOwnership(value);
              writeSelection({ ownership: value });
            }}
            onFindDomain={() => setFocusSignal((n) => n + 1)}
            onSelectPlan={(key) => {
              setPlanKey(key);
              writeSelection({ hostingPlan: key });
            }}
          />
        </div>

        {selectedDomain && !planKey && (
          <p className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            {t("fnd.cross.selected", { domain: selectedDomain })}
          </p>
        )}

        <div className="mt-5">
          <FoundationSummary
            selectedDomain={selectedDomain}
            planKey={planKey}
            websiteInterest={websiteInterest}
            onToggleWebsite={setWebsiteInterest}
          />
        </div>
      </div>
    </section>
  );
}
