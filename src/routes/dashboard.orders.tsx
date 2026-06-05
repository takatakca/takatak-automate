import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";
import { useQuery } from "@tanstack/react-query";
import { listOrders, type OrderRecord } from "@/lib/orders";
import { OrderStatusBadge, orderNextAction } from "@/components/marketplace/OrderStatusBadge";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/orders")({
  head: () => ({
    meta: [
      { title: "Orders — TAKATAK" },
      { name: "description", content: "Service orders and provisioning status." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "orders"],
    queryFn: () => listOrders(),
    retry: 1,
  });
  const orders = data?.orders ?? [];
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Orders</h1>
      <p className="text-muted-foreground mt-1">Service orders and provisioning status.</p>
      <div className="mt-8">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading orders…
          </div>
        ) : isError ? (
          <EmptyState
            title="Couldn't load orders"
            description="We couldn't reach the orders service. Try again in a moment or contact support."
          />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="When you check out a marketplace package or post a custom project, it will appear here."
          />
        ) : (
          <ul className="grid gap-3">
            {orders.map((o) => (<OrderRow key={o.id} order={o} />))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}

function OrderRow({ order }: { order: OrderRecord }) {
  const meta = (order.meta ?? {}) as {
    title?: string;
    packageId?: string;
    projectId?: string;
    providerSessionId?: string;
    paymentProvider?: string;
  };
  const amount = order.amountCents != null
    ? new Intl.NumberFormat("en-CA", { style: "currency", currency: order.currency || "CAD" })
        .format(order.amountCents / 100)
    : "—";
  const shortId = order.id.slice(-8).toUpperCase();
  return (
    <li className="rounded-xl border border-border bg-card p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{meta.title ?? order.serviceKey}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Order #{shortId} · {new Date(order.createdAt).toLocaleDateString()}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{orderNextAction(order.status)}</p>
      </div>
      <div className="md:text-right">
        <div className="font-semibold">{amount}</div>
        <div className="text-xs text-muted-foreground">{order.currency}</div>
      </div>
    </li>
  );
}
