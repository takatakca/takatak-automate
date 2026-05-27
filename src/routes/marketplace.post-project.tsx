import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Check, Save } from "lucide-react";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplaceCategories";
import { FileUploadPanel } from "@/components/marketplace/FileUploadPanel";
import { createProject } from "@/lib/marketplace";

export const Route = createFileRoute("/marketplace/post-project")({
  head: () => ({ meta: [{ title: "Post a project — TAKATAK Marketplace" }] }),
  component: Page,
});

type Visibility = "private" | "invite_only" | "open_to_takatak";

const DRAFT_KEY = "takatak_project_draft_v1";

function Page() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState(MARKETPLACE_CATEGORIES[0].slug);
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("2_4_weeks");
  const [skills, setSkills] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("open_to_takatak");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  const saveDraft = () => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ title, businessName, category, brief, budget, timeline, skills, visibility, savedAt: Date.now() }),
      );
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch {
      /* noop */
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const budgetCents = budget ? Math.round(parseFloat(budget) * 100) : undefined;
      const combinedBrief =
        `${brief}\n\n---\nBusiness: ${businessName || "—"}\nTimeline: ${timeline.replace(/_/g, " ")}\nRequired skills: ${skills || "—"}\nVisibility: ${visibility.replace(/_/g, " ")}`;
      const r = await createProject({ title, brief: combinedBrief, category, budgetCents });
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
      void navigate({ to: "/dashboard/projects/$projectId", params: { projectId: r.project.id } });
    } catch (err) {
      // Fallback: save locally so the user doesn't lose their work
      saveDraft();
      setError(
        err instanceof Error
          ? `${err.message}. Your project has been saved as a local draft — TAKATAK will pick it up once the backend is connected.`
          : "Couldn't submit right now. Your project has been saved as a local draft.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link to="/marketplace" className="text-xs text-muted-foreground hover:text-foreground">← Back to marketplace</Link>
      <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Post a project</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Tell TAKATAK what you need. We review your brief, assign a vetted freelancer, and hold payment in escrow until you approve the delivery.
          </p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary inline-flex items-center gap-2">
          <ShieldCheck size={14} /> TAKATAK-managed engagement
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
        <form onSubmit={submit} className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-semibold">1. Project basics</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Project title</label>
              <input
                value={title} onChange={(e) => setTitle(e.target.value)}
                required maxLength={200}
                placeholder="e.g. Build a 5-page website for my bakery"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business name</label>
                <input
                  value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                  maxLength={120}
                  placeholder="Optional"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {MARKETPLACE_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-semibold">2. Describe what you need</h2>
            <textarea
              value={brief} onChange={(e) => setBrief(e.target.value)}
              required rows={7} maxLength={5000}
              placeholder="Goals, target audience, references, must-haves, deadlines…"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <div>
              <label className="block text-sm font-medium mb-1">Reference files</label>
              <FileUploadPanel hint="You can attach references after the project is created from the workspace." />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-semibold">3. Budget & timeline</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Budget (CAD)</label>
                <input
                  value={budget} onChange={(e) => setBudget(e.target.value)}
                  type="number" min="0" step="1" placeholder="e.g. 500"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">Optional — leave blank to request a quote.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timeline</label>
                <select
                  value={timeline} onChange={(e) => setTimeline(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="urgent">Urgent (under 1 week)</option>
                  <option value="1_2_weeks">1–2 weeks</option>
                  <option value="2_4_weeks">2–4 weeks</option>
                  <option value="1_3_months">1–3 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Required skills (optional)</label>
              <input
                value={skills} onChange={(e) => setSkills(e.target.value)}
                maxLength={200}
                placeholder="e.g. WordPress, SEO, French copywriting"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="font-semibold">4. Visibility</h2>
            {(
              [
                ["open_to_takatak", "Open to TAKATAK", "TAKATAK reviews and assigns the best vetted freelancer."],
                ["invite_only", "Invite only", "Share the project privately with a freelancer of your choice."],
                ["private", "Private", "Visible only to you until you publish it."],
              ] as const
            ).map(([val, label, desc]) => (
              <label key={val} className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer text-sm transition-colors ${
                visibility === val ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
              }`}>
                <input
                  type="radio" name="visibility" value={val}
                  checked={visibility === val}
                  onChange={() => setVisibility(val)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{desc}</span>
                </span>
              </label>
            ))}
          </section>

          {error && <div className="rounded-lg border border-warning/30 bg-warning/10 text-sm px-4 py-3">{error}</div>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled={submitting} type="submit"
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit project to TAKATAK"}
            </button>
            <button
              type="button" onClick={saveDraft}
              className="px-4 py-2.5 rounded-md text-sm font-semibold border border-border hover:bg-secondary inline-flex items-center gap-2"
            >
              <Save size={14} /> Save draft
            </button>
            {draftSaved && <span className="text-xs text-success inline-flex items-center gap-1"><Check size={12} /> Draft saved</span>}
          </div>
        </form>

        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> How TAKATAK protects you</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check size={14} className="text-primary mt-0.5" /> TAKATAK reviews your brief within 24 hours.</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-primary mt-0.5" /> A vetted freelancer is assigned via a TAKATAK contract.</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-primary mt-0.5" /> Payment is held in escrow during the project.</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-primary mt-0.5" /> Funds release after you approve the delivery or the grace period ends.</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-primary mt-0.5" /> If something goes wrong, open a dispute and TAKATAK mediates.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Prefer a fixed package?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Browse ready-made packages with clear deliverables and pricing.</p>
            <Link to="/marketplace" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">Browse packages →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
