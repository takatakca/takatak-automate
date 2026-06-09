import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { listNotifications } from "@/lib/notifications";

export function NotificationBell() {
  const q = useQuery({
    queryKey: ["notifications", "summary"],
    queryFn: listNotifications,
    refetchInterval: 60_000,
    retry: false,
  });
  const unread = q.data?.unread ?? 0;
  return (
    <Link
      to="/dashboard/notifications"
      className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border border-border hover:bg-secondary"
      aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
    >
      <Bell size={14} />
      <span className="hidden sm:inline">Notifications</span>
      {unread > 0 && (
        <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}