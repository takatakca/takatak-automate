import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UpmindDac } from "@/components/UpmindDac";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — TAKATAK" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  return (
    <SiteShell>
      <ProtectedRoute>
        <Inner />
      </ProtectedRoute>
    </SiteShell>
  );
}

function Inner() {
  const { user } = useAuth();
  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-center">Power your online success</h1>
      <p className="mt-3 text-center text-muted-foreground">Secure your domain, hosting, and add-ons in one flow.</p>
      <div className="mt-10 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <UpmindDac clientId={(user as { upmindClientId?: string } | null)?.upmindClientId} />
      </div>
    </section>
  );
}