import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { UpmindDac } from "@/components/UpmindDac";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/domain")({
  head: () => ({ meta: [{ title: "Domain Names — TAKATAK" }] }),
  component: DomainPage,
});

function DomainPage() {
  const { user } = useAuth();
  return (
    <SiteShell>
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center">Find your perfect domain</h1>
        <p className="mt-3 text-center text-muted-foreground">Instant search, registration, and DNS — fully automated.</p>
        <div className="mt-10 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <UpmindDac clientId={(user as { upmindClientId?: string } | null)?.upmindClientId} />
        </div>
      </section>
    </SiteShell>
  );
}