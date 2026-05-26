import type { ClientProject, ProjectFile, ProjectMessage, ProjectMilestone, ProjectDelivery } from "@/lib/marketplace";
import { PaymentReleaseStatus } from "./PaymentReleaseStatus";
import { MilestoneTimeline } from "./MilestoneTimeline";
import { FileUploadPanel } from "./FileUploadPanel";
import { File as FileIcon, MessageSquare } from "lucide-react";

export function ProjectWorkspace({
  project, messages, files, milestones, deliveries,
  onApprove, onRequestRevision, onDispute, onSendMessage,
}: {
  project: ClientProject;
  messages: ProjectMessage[];
  files: ProjectFile[];
  milestones: ProjectMilestone[];
  deliveries: ProjectDelivery[];
  onApprove?: () => void;
  onRequestRevision?: () => void;
  onDispute?: () => void;
  onSendMessage?: (text: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <div className="text-xs text-muted-foreground mt-1 capitalize">{project.category.replace(/_/g, " ")} · {project.status}</div>
            </div>
            <PaymentReleaseStatus state={project.paymentState} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">{project.brief}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold flex items-center gap-2"><MessageSquare size={16} /> Messages</h2>
          <div className="mt-3 space-y-3 max-h-80 overflow-y-auto">
            {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
            {messages.map((m) => (
              <div key={m.id} className="text-sm">
                <div className="text-xs text-muted-foreground">{m.from} · {new Date(m.at).toLocaleString()}</div>
                <div className="mt-0.5">{m.body}</div>
              </div>
            ))}
          </div>
          {onSendMessage && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const t = String(fd.get("msg") || "").trim();
                if (t) onSendMessage(t);
                (e.currentTarget as HTMLFormElement).reset();
              }}
              className="mt-4 flex gap-2"
            >
              <input name="msg" placeholder="Write a message…" className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <button className="px-4 py-2 rounded-md text-sm font-medium text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>Send</button>
            </form>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Deliveries</h2>
          {deliveries.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No deliveries yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {deliveries.map((d) => (
                <li key={d.id} className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">{new Date(d.submittedAt).toLocaleString()}</div>
                  {d.note && <div className="text-sm mt-1">{d.note}</div>}
                  <ul className="mt-2 text-sm space-y-1">
                    {d.files.map((f) => (
                      <li key={f.id} className="flex items-center gap-2 text-muted-foreground">
                        <FileIcon size={14} /> {f.name}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          {(onApprove || onRequestRevision || onDispute) && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {onApprove && <button onClick={onApprove} className="px-3 py-1.5 rounded-md text-xs font-medium text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>Approve</button>}
              {onRequestRevision && <button onClick={onRequestRevision} className="px-3 py-1.5 rounded-md text-xs border border-border">Request revision</button>}
              {onDispute && <button onClick={onDispute} className="px-3 py-1.5 rounded-md text-xs border border-destructive/30 text-destructive">Open dispute</button>}
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Milestones</h2>
          <div className="mt-3"><MilestoneTimeline milestones={milestones} /></div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Files</h2>
          {files.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No files uploaded yet.</p>
          ) : (
            <ul className="mt-3 space-y-1 text-sm">
              {files.map((f) => (
                <li key={f.id} className="flex items-center gap-2 text-muted-foreground">
                  <FileIcon size={14} /> {f.name}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4"><FileUploadPanel /></div>
        </div>
      </aside>
    </div>
  );
}