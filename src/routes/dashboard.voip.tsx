import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, EmptyState } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard/voip")({
  head: () => ({
    meta: [
      { title: "VoIP business phone — TAKATAK" },
      { name: "description", content: "Business phone numbers, IVR, and call activity." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">VoIP business phone</h1>
      <p className="text-muted-foreground mt-1">Business phone numbers, IVR, and call activity.</p>
      <div className="mt-8">
        <EmptyState title="Nothing here yet" description="Once your services are active, real data from the TAKATAK backend will appear here." />
      </div>
    </DashboardShell>
  );
}
