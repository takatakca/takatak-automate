import { Search, FileSignature, MessageSquare, ShieldCheck } from "lucide-react";

const STEPS = [
  { n: "01", icon: Search, t: "Find or post", d: "Browse curated services or post a project — TAKATAK matches the right freelancer." },
  { n: "02", icon: FileSignature, t: "Agree the scope", d: "Confirm deliverables, price and timeline in a clear digital contract." },
  { n: "03", icon: MessageSquare, t: "Work in one place", d: "Chat, share files, and track milestones inside your project workspace." },
  { n: "04", icon: ShieldCheck, t: "Approve & release", d: "Funds stay in escrow until you approve the final delivery." },
];

export function HowItWorks() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">How TAKATAK works</h2>
        <p className="mt-1 text-sm text-muted-foreground">Four simple steps from brief to delivery.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.n} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-muted-foreground">{s.n}</div>
                <Icon size={18} className="text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}