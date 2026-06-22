/**
 * Dev-only banner that appears when VITE_DEMO_MARKETPLACE=true.
 * Signals the marketplace is reading seeded demo data so reviewers don't
 * mistake fixture content for production data. Hidden in production builds.
 */
export function DemoModeBanner() {
  const enabled =
    (import.meta as unknown as { env: Record<string, string | undefined> }).env
      .VITE_DEMO_MARKETPLACE === "true";
  if (!enabled) return null;
  return (
    <div
      role="status"
      className="w-full bg-amber-500/15 text-amber-900 border-b border-amber-500/30 text-[12px] py-1.5 px-3 text-center font-medium"
    >
      Demo marketplace data enabled · run{" "}
      <code className="px-1 rounded bg-amber-500/20">
        SEED_DEMO_MARKETPLACE=true npm run prisma:seed:demo
      </code>{" "}
      on the backend if dashboards are empty.
    </div>
  );
}