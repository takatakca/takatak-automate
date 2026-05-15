import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Sparkles, Check } from "lucide-react";
import { startAIIntake } from "@/lib/intake.functions";
import { getAuthToken } from "@/lib/auth-store";

const fields = [
  { key: "businessName", label: "Business name", placeholder: "TAKATAK Co." },
  { key: "industry", label: "Industry", placeholder: "e.g. Real estate, restaurant, SaaS" },
  { key: "location", label: "Location", placeholder: "City, Province / State" },
  { key: "targetCustomers", label: "Target customers", placeholder: "Who do you sell to?" },
  { key: "goals", label: "Primary goals", placeholder: "More leads, online sales, etc." },
  { key: "existingWebsite", label: "Existing website (optional)", placeholder: "https://" },
  { key: "domainPreference", label: "Preferred domain", placeholder: "yourbrand.ca" },
  { key: "servicesNeeded", label: "Services needed", placeholder: "Website, hosting, marketing..." },
  { key: "brandStyle", label: "Brand style", placeholder: "Modern, classic, playful..." },
  { key: "contentNeeds", label: "Content needs", placeholder: "Copywriting, photography, blog..." },
  { key: "budgetRange", label: "Budget range", placeholder: "$ CAD per month" },
  { key: "urgency", label: "Urgency", placeholder: "ASAP, 1 month, flexible..." },
  { key: "notes", label: "Anything else?", placeholder: "Notes for the TAKATAK team" },
] as const;

const STORAGE_KEY = (serviceKey: string) => `takatak.intake.${serviceKey}`;

export function AIIntakeWizard({ serviceKey }: { serviceKey: string }) {
  const startIntake = useServerFn(startAIIntake);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY(serviceKey));
    if (stored) {
      try {
        setAnswers(JSON.parse(stored) as Record<string, string>);
      } catch {
        /* ignore */
      }
    }
  }, [serviceKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY(serviceKey), JSON.stringify(answers));
  }, [answers, serviceKey]);

  const f = fields[step];
  const total = fields.length;
  const progress = Math.round(((step + 1) / total) * 100);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = (await startIntake({
        data: { serviceKey, answers, token: getAuthToken() },
      })) as { ok: boolean; message?: string };
      setDone({
        ok: res.ok,
        msg: res.ok
          ? "TAKATAK AI-assisted setup will prepare your project brief and service checklist."
          : (res.message ??
              "AI intake is not available yet. Your answers have been saved locally."),
      });
    } catch {
      setDone({
        ok: false,
        msg: "AI intake is not available yet. Your answers have been saved locally.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-success/20 text-success flex items-center justify-center">
          <Check size={22} />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Intake submitted</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          {done.msg}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles size={16} className="text-accent" />
        TAKATAK AI Intake · Step {step + 1} of {total}
      </div>
      <div className="mt-3 h-1 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${progress}%`, backgroundImage: "var(--gradient-hero)" }}
        />
      </div>
      <label className="block mt-6 text-base font-medium">{f.label}</label>
      <textarea
        value={answers[f.key] ?? ""}
        onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })}
        placeholder={f.placeholder}
        rows={3}
        className="mt-2 w-full px-4 py-3 rounded-md bg-input border border-border outline-none focus:ring-2 focus:ring-ring text-sm"
      />
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-border disabled:opacity-30"
        >
          <ChevronLeft size={14} /> Back
        </button>
        {step < total - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md text-primary-foreground disabled:opacity-60"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            <Sparkles size={14} />
            {submitting ? "Submitting…" : "Submit intake"}
          </button>
        )}
      </div>
    </div>
  );
}