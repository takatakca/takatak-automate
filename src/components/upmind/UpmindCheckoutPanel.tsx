import { UpmindDomainSearch } from "./UpmindDomainSearch";
import { UpmindHostingPlans } from "./UpmindHostingPlans";

/**
 * Combined domain + hosting panel used on the checkout page. The Upmind
 * client ID (if any) is resolved by the children from auth context.
 */
export function UpmindCheckoutPanel() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold">Find a domain</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Search availability, register, and bundle with hosting in one flow.
        </p>
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <UpmindDomainSearch />
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Choose a hosting plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Managed WordPress hosting in CAD. Add to the same order.
        </p>
        <div className="mt-4">
          <UpmindHostingPlans />
        </div>
      </section>
    </div>
  );
}