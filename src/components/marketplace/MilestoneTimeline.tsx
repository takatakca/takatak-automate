import type { ProjectMilestone } from "@/lib/marketplace";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export function MilestoneTimeline({ milestones }: { milestones: ProjectMilestone[] }) {
  if (!milestones.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
        No milestones yet. TAKATAK will define milestones once a freelancer is assigned.
      </div>
    );
  }
  return (
    <ol className="relative border-l border-border ml-3 space-y-4">
      {milestones.map((m) => {
        const Icon = m.status === "completed" ? CheckCircle2 : m.status === "in_progress" ? Clock : Circle;
        const color =
          m.status === "completed" ? "text-success" : m.status === "in_progress" ? "text-primary" : "text-muted-foreground";
        return (
          <li key={m.id} className="ml-4">
            <span className="absolute -left-2.5 mt-0.5 bg-background">
              <Icon size={18} className={color} />
            </span>
            <div className="font-medium text-sm">{m.title}</div>
            <div className="text-xs text-muted-foreground capitalize">{m.status.replace(/_/g, " ")}</div>
          </li>
        );
      })}
    </ol>
  );
}