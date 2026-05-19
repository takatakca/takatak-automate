import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import { ServiceStateBadge } from "@/components/automation/ServiceStateBadge";
import { EmptyState } from "@/components/layout/DashboardShell";
import {
  filterByServiceKeys,
  getUserServices,
  type ServiceInstance,
} from "@/lib/serviceInstances";
import { getService } from "@/lib/services";
import { LaunchExternalServiceButton } from "@/components/LaunchExternalServiceButton";

interface Props {
  /** Restrict to these service keys (category page). Empty = all */
  serviceKeys?: string[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyCta?: { to: string; label: string };
}

export function UserServicesPanel({
  serviceKeys,
  emptyTitle = "No services yet",
  emptyDescription = "Once you start a TAKATAK service, it will appear here with live status.",
  emptyCta,
}: Props) {
  const q = useQuery({
    queryKey: ["user", "services"],
    queryFn: getUserServices,
    retry: 1,
  });

  if (q.isLoading) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground text-sm">
        <Loader2 size={18} className="inline animate-spin mr-2" />
        Loading your TAKATAK services…
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
        <div className="flex items-center gap-2 text-destructive font-medium">
          <AlertTriangle size={16} /> Couldn't load your services
        </div>
        <p className="mt-1 text-muted-foreground">
          {q.error instanceof Error
            ? q.error.message
            : "TAKATAK backend is unreachable."}
        </p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  const all = q.data?.services ?? [];
  const list = serviceKeys && serviceKeys.length > 0
    ? filterByServiceKeys(all, serviceKeys)
    : all;

  if (list.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        cta={
          emptyCta && (
            <Link
              to={emptyCta.to}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              {emptyCta.label} <ArrowRight size={14} />
            </Link>
          )
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {list.map((i) => (
        <ServiceInstanceCard key={i.id} instance={i} />
      ))}
    </div>
  );
}

function ServiceInstanceCard({ instance }: { instance: ServiceInstance }) {
  const def = getService(instance.serviceKey);
  const title = def?.title ?? instance.serviceKey;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold truncate">{title}</h3>
        <ServiceStateBadge state={instance.state} />
      </div>
      {def?.shortDescription && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {def.shortDescription}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
        {def?.dashboardRoute && (
          <Link
            to={def.dashboardRoute}
            className="inline-flex items-center gap-1 text-sm text-primary"
          >
            {def.dashboardCtaLabel ?? "Open"} <ArrowRight size={14} />
          </Link>
        )}
        {def?.integrationType === "external_portal" && (
          <LaunchExternalServiceButton
            serviceKey={def.launchKey ?? def.key}
            envKey={def.portalEnvKey}
            label="Launch portal"
          />
        )}
      </div>
    </div>
  );
}