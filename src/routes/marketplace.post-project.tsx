import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplaceCategories";
import { FileUploadPanel } from "@/components/marketplace/FileUploadPanel";
import { createProject } from "@/lib/marketplace";

export const Route = createFileRoute("/marketplace/post-project")({
  head: () => ({ meta: [{ title: "Post a project — TAKATAK Marketplace" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [category, setCategory] = useState(MARKETPLACE_CATEGORIES[0].slug);
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const budgetCents = budget ? Math.round(parseFloat(budget) * 100) : undefined;
      const r = await createProject({ title, brief, category, budgetCents });
      void navigate({ to: "/dashboard/projects/$projectId", params: { projectId: r.project.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Sign in and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Post a project</h1>
      <p className="mt-2 text-sm text-muted-foreground">TAKATAK reviews your brief and assigns a vetted freelancer. Payment is held in escrow.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Project title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            {MARKETPLACE_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Brief</label>
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} required rows={6} maxLength={5000} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Describe what you need, target audience, deadlines, references…" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Budget (CAD, optional)</label>
          <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" min="0" step="1" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <FileUploadPanel hint="Attach references after the project is created from the project workspace." />
        {error && <div className="text-sm text-destructive">{error}</div>}
        <button disabled={submitting} type="submit" className="px-5 py-2.5 rounded-md text-sm font-semibold text-primary-foreground disabled:opacity-60" style={{ backgroundImage: "var(--gradient-hero)" }}>
          {submitting ? "Submitting…" : "Submit project"}
        </button>
      </form>
    </div>
  );
}