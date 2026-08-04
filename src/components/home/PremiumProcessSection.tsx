import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ClipboardCheck, FileText, MessageSquare, Search, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/lib/i18n";

const steps = [
  { n: "01", icon: Search, k: "s1" },
  { n: "02", icon: FileText, k: "s2" },
  { n: "03", icon: MessageSquare, k: "s3" },
  { n: "04", icon: ShieldCheck, k: "s4" },
];

const workspace = ["w1", "w2", "w3", "w4", "w5"];

export function PremiumProcessSection() {
  const { t } = useLanguage();
  return (
    <section className="brand-dark relative overflow-hidden border-y border-border">
      <div aria-hidden className="absolute inset-0 opacity-35" style={{ backgroundImage: "linear-gradient(var(--brand-dark-border) 1px, transparent 1px), linear-gradient(90deg, var(--brand-dark-border) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 md:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/35 px-3 py-1 text-xs font-semibold text-muted-foreground">
            <ClipboardCheck size={14} className="text-primary" /> {t("home.process.badge")}
          </div>
          <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight text-foreground md:text-5xl">{t("home.process.title")}</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">{t("home.process.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/marketplace/post-project" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              {t("home.process.cta1")} <ArrowRight size={15} />
            </Link>
            <Link to="/marketplace" className="inline-flex items-center gap-2 rounded-md border border-border bg-card/25 px-5 py-3 text-sm font-medium text-foreground hover:bg-card/45">
              {t("home.process.cta2")}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="relative rounded-3xl border border-border bg-card/45 p-4 shadow-[0_30px_80px_-48px_rgba(0,0,0,0.9)] sm:p-5">
            <div aria-hidden className="absolute bottom-8 left-8 top-8 w-px bg-border md:left-10" />
            <div className="space-y-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.n} className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border bg-card text-primary">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">{step.n}</span>
                        <h3 className="font-semibold text-foreground">{t(`home.process.${step.k}.title` as TranslationKey)}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`home.process.${step.k}.desc` as TranslationKey)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
          <aside className="rounded-3xl border border-border bg-background/75 p-4 shadow-[0_30px_80px_-48px_rgba(0,0,0,0.95)] backdrop-blur">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{t("home.process.wsKicker")}</p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">{t("home.process.wsTitle")}</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">72%</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[72%] rounded-full bg-primary" />
              </div>
              <div className="mt-5 space-y-3">
                {workspace.map((item, index) => (
                  <div key={item} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-3">
                    <span className="inline-flex min-w-0 items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 size={15} className="shrink-0 text-primary" />
                      <span className="truncate">{t(`home.process.${item}` as TranslationKey)}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[11px] text-muted-foreground">{index < 3 ? t("home.process.active") : t("home.process.next")}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}