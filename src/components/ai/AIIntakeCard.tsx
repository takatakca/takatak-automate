import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";

export function AIIntakeCard({
  serviceKey,
  serviceTitle,
  description,
  href,
}: {
  serviceKey: string;
  serviceTitle: string;
  description: string;
  href: string;
}) {
  return (
    <div
      key={serviceKey}
      className="rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-accent">
            <Sparkles size={12} /> AI-assisted setup
          </div>
          <h3 className="mt-2 text-lg font-semibold">{serviceTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Link
        to={href}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
      >
        Start intake <ArrowRight size={14} />
      </Link>
    </div>
  );
}