import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Clock, ShieldCheck, MessageSquare, Check, RefreshCw } from "lucide-react";
import { ServiceThumbnail } from "@/components/marketplace/ServiceThumbnail";
import { getPackage } from "@/lib/marketplacePackages";
import { startPackageCheckout, saveQuotePrefill } from "@/lib/orders";

export const Route = createFileRoute("/marketplace/gigs/$id")({
  head: () => ({ meta: [{ title: "Service — TAKATAK Marketplace" }] }),
  component: Page,
});

function dollars(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function Page() {
  const { id } = Route.useParams();
  const pkg = getPackage(id);
  const navigate = useNavigate();
  const [tierIdx, setTierIdx] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);

  if (!pkg) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Link to="/marketplace" className="text-xs text-muted-foreground hover:text-foreground">← Back to marketplace</Link>
        <h1 className="mt-4 text-2xl font-bold">Package not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This package isn't published yet, or the link is incorrect.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/marketplace" className="px-4 py-2 rounded-md text-sm font-semibold border border-border hover:bg-secondary">Browse marketplace</Link>
          <Link to="/marketplace/post-project" className="px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90">Post a custom project</Link>
        </div>
      </div>
    );
  }

  const tier = pkg.tiers[tierIdx];
  const addonsTotal = selectedAddons.reduce((s, i) => s + pkg.addons[i].priceCents, 0);
  const total = tier.priceCents + addonsTotal;

  const toggleAddon = (i: number) =>
    setSelectedAddons((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const buildAddons = () => selectedAddons.map((i) => ({ label: pkg.addons[i].label, priceCents: pkg.addons[i].priceCents }));

  const continueCheckout = async () => {
    setFallback(null);
    setSubmitting(true);
    try {
      const res = await startPackageCheckout({
        packageId: pkg.id,
        title: pkg.title,
        category: pkg.category,
        tier: { name: tier.name, priceCents: tier.priceCents, deliveryDays: tier.deliveryDays },
        addons: buildAddons(),
        quantity: 1,
        currency: "CAD",
      });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setFallback(
        "Checkout isn't configured yet. Your package selection was saved — TAKATAK will reach out to finalize payment.",
      );
    } catch {
      // Save the selection locally so the user keeps their context.
      saveQuotePrefill({
        packageId: pkg.id, title: pkg.title, category: pkg.category,
        tierName: tier.name, tierPriceCents: tier.priceCents,
        addons: buildAddons(), totalCents: total,
      });
      setFallback(
        "Checkout isn't available right now. Your package selection was saved — continue as a custom project to keep going.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const requestQuote = () => {
    saveQuotePrefill({
      packageId: pkg.id, title: pkg.title, category: pkg.category,
      tierName: tier.name, tierPriceCents: tier.priceCents,
      addons: buildAddons(), totalCents: total,
    });
    void navigate({ to: "/marketplace/post-project" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/marketplace" className="text-xs text-muted-foreground hover:text-foreground">← Back to marketplace</Link>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
        {/* Left: detail */}
        <div className="space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{pkg.categoryName}</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold text-foreground leading-tight">{pkg.title}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Star size={14} className="fill-foreground text-foreground" />
              <span className="font-semibold text-foreground">{pkg.rating.toFixed(1)}</span>
              <span>({pkg.reviews} reviews)</span>
              <span>·</span>
              <span>Delivered by a TAKATAK-vetted freelancer</span>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <ServiceThumbnail kind={pkg.thumb} />
          </div>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">About this package</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{pkg.description}</p>
          </section>

          {/* Tier comparison */}
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-3 border-b border-border">
              {pkg.tiers.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setTierIdx(i)}
                  className={`px-4 py-3 text-sm font-semibold transition-colors ${
                    i === tierIdx
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="p-6">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">{dollars(tier.priceCents)}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-3">
                  <span className="inline-flex items-center gap-1"><Clock size={12} /> {tier.deliveryDays} days</span>
                  <span className="inline-flex items-center gap-1"><RefreshCw size={12} /> {tier.revisions} revisions</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {tier.includes.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-foreground">
                    <Check size={14} className="text-primary mt-1 shrink-0" /> {it}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Add-ons */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">Add-ons & upgrades</h2>
            <p className="mt-1 text-xs text-muted-foreground">Optional extras you can stack on this package.</p>
            <ul className="mt-4 space-y-2">
              {pkg.addons.map((a, i) => {
                const on = selectedAddons.includes(i);
                return (
                  <li key={a.label}>
                    <button
                      onClick={() => toggleAddon(i)}
                      className={`w-full flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                        on ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${on ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                          {on && <Check size={11} />}
                        </span>
                        <span className="font-medium text-foreground">{a.label}</span>
                        {a.deliveryDays && <span className="text-xs text-muted-foreground">+{a.deliveryDays}d</span>}
                      </span>
                      <span className="font-semibold text-foreground">+{dollars(a.priceCents)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* FAQ */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">Frequently asked questions</h2>
            <ul className="mt-3 divide-y divide-border">
              {pkg.faq.map((f) => (
                <li key={f.q} className="py-3">
                  <div className="font-medium text-foreground text-sm">{f.q}</div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right: order summary */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-xs text-muted-foreground">Selected tier · {tier.name}</div>
            <div className="mt-1 text-3xl font-bold text-foreground">{dollars(total)}</div>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground border-y border-border py-3">
              <span className="inline-flex items-center gap-1"><Clock size={12} /> {tier.deliveryDays} days</span>
              <span>·</span>
              <span>{tier.revisions} revisions</span>
              {selectedAddons.length > 0 && <><span>·</span><span>+{selectedAddons.length} add-on{selectedAddons.length === 1 ? "" : "s"}</span></>}
            </div>
            <button
              onClick={continueCheckout}
              disabled={submitting}
              className="mt-4 w-full text-center px-4 py-2.5 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Starting checkout…" : `Continue (${dollars(total)})`}
            </button>
            <button
              onClick={requestQuote}
              className="mt-2 w-full text-center px-4 py-2.5 rounded-md text-sm font-semibold text-foreground border border-border hover:bg-secondary"
            >
              Request a custom quote
            </button>
            {fallback && (
              <p className="mt-3 text-xs text-warning bg-warning/10 border border-warning/30 rounded-md px-3 py-2">
                {fallback}
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground inline-flex items-start gap-1.5">
              <ShieldCheck size={12} className="text-primary mt-0.5" />
              Payment is held by TAKATAK and only released after you approve the delivery.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-2"><Check size={12} className="text-primary mt-0.5" /> TAKATAK assigns a vetted freelancer within 24 hours.</div>
            <div className="flex items-start gap-2"><Check size={12} className="text-primary mt-0.5" /> All messages run through your TAKATAK workspace.</div>
            <div className="flex items-start gap-2"><MessageSquare size={12} className="text-primary mt-0.5" /> Free revisions during the active project.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
