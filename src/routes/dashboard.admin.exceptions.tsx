import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/admin/exceptions")({
  head: () => ({
    meta: [
      { title: "Admin · Exceptions — TAKATAK" },
      { name: "description", content: "Services needing TAKATAK human review." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Page,
});

/**
 * Hidden admin view backed by GET /admin/exceptions on the Render backend.
 * Not linked in the sidebar — gated behind the feature flag below until the
 * frontend reliably surfaces an `admin` role from the auth token. Until then,
 * non-admin users will simply get a 403 from the backend.
 */
function isAdminFeatureEnabled(): boolean {
  if (typeof window === "undefined") return false;
  // Either an explicit opt-in OR a future auth claim hook can flip this.
  return window.localStorage.getItem("takatak.adminMode") === "1";
}

function Page() {
  const enabled = isAdminFeatureEnabled();
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Exceptions</h1>
      <p className="text-muted-foreground mt-1">
        Services waiting on TAKATAK, intake jobs needing review, and provisioning failures.
      </p>
      <div className="mt-8">
        {enabled ? (
          <EmptyState
            title="Connect /admin/exceptions"
            description="This view will render the response of GET /admin/exceptions once an admin role claim is wired through auth. Until then, this page is hidden from the sidebar."
          />
        ) : (
          <EmptyState
            title="Admin only"
            description="This page is gated. Set localStorage 'takatak.adminMode' = '1' in a trusted browser to preview the layout. Backend still enforces admin role server-side."
          />
        )}
      </div>
    </DashboardShell>
  );
}
