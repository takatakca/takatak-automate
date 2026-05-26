import { ShieldCheck, BadgeCheck, Headphones, Banknote } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, t: "Escrow protection", d: "Payment is held by TAKATAK and released on approval." },
  { icon: BadgeCheck, t: "Vetted talent", d: "Every freelancer is screened by Groupe TAKATAK before joining." },
  { icon: Headphones, t: "Human support", d: "Real people on standby when a project needs a hand." },
  { icon: Banknote, t: "Transparent pricing", d: "Fixed prices and clear scope — no hidden fees." },
];

export function TrustBlock() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {ITEMS.map((i) => {
          const Icon = i.icon;
          return (
            <div key={i.t}>
              <div className="w-10 h-10 rounded-lg bg-secondary text-primary flex items-center justify-center">
                <Icon size={18} />
              </div>
              <div className="mt-3 font-semibold text-foreground">{i.t}</div>
              <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{i.d}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}