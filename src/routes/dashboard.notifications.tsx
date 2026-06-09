import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";
import { listNotifications, markAllNotificationsRead, markNotificationRead, type Notification } from "@/lib/notifications";
import { Bell, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications — TAKATAK" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notifications", "list"], queryFn: listNotifications, retry: false });
  const readOne = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const readAll = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const items: Notification[] = q.data?.notifications ?? [];
  const unread = q.data?.unread ?? 0;

  return (
    <DashboardShell>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bell size={20} /> Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unread > 0 ? `${unread} unread` : "You're all caught up."}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => readAll.mutate()}
            disabled={readAll.isPending}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold border border-border hover:bg-secondary"
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>
      <div className="mt-6 space-y-2">
        {q.isError && (
          <EmptyState title="Notifications unavailable" description="We couldn't load notifications right now. Try again in a moment." />
        )}
        {!q.isError && items.length === 0 && (
          <EmptyState title="No notifications yet" description="You'll see project updates, deliveries, approvals, and payouts here." />
        )}
        {items.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl border border-border p-4 flex items-start justify-between gap-4 ${n.readAt ? "bg-card" : "bg-primary/5 border-primary/20"}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{n.type}</span>
                {!n.readAt && <span className="text-[10px] font-bold uppercase text-primary">New</span>}
              </div>
              <h3 className="font-semibold mt-1">{n.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
              {n.actionUrl && (
                <a href={n.actionUrl} className="text-xs font-semibold text-primary mt-2 inline-block hover:underline">
                  Open →
                </a>
              )}
            </div>
            {!n.readAt && (
              <button
                onClick={() => readOne.mutate(n.id)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}