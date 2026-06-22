import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Clock, ShieldCheck, MessageSquare, Check, RefreshCw } from "lucide-react";
import { ServiceThumbnail } from "@/components/marketplace/ServiceThumbnail";
import { getPackage, relatedPackages, formatStartingPrice, shortestDelivery } from "@/lib/marketplacePackages";
import { startPackageCheckout, saveQuotePrefill } from "@/lib/orders";
import { useQuery } from "@tanstack/react-query";
import { getMarketplacePackage } from "@/lib/marketplaceCatalogApi";
import { CatalogSourceIndicator } from "@/components/dev/CatalogSourceIndicator";
import { CheckoutPromoInput } from "@/components/promotions/CheckoutPromoInput";

export const Route = createFileRoute("/marketplace/gigs/$id")({
  head: () => ({ meta: [{ title: "Service — TAKATAK Marketplace" }] }),
  component: Page,
});

function dollars(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function Page() {
  const { id } = Route.useParams();
  const localPkg = getPackage(id);
  const { data: remote } = useQuery({
    queryKey: ["marketplace", "package", id],
    queryFn: () => getMarketplacePackage(id),
    staleTime: 60_000,
  });
  const pkg = remote?.data ?? localPkg;
  const source = remote?.source;
  const navigate = useNavigate();
  const [tierIdx, setTierIdx] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);

  if (!pkg) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CatalogSourceIndicator source={source} />
        <Link to="/marketplace" className="text-xs text-muted-foreground hover:text-foreground">← Back to marketplace</Link>
        <h1 className="mt-4 text-2xl font-bold">Package not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This package isn't published yet, or the link is incorrect.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/marketplace" className="px-4 py-2 rounded-md text-sm font-semibold border border-border hover:bg-secondary">Browse marketplace</Link>
          <Link to="/marketplace/post-project" className="px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90">Post a custom project</Link>
        </div>
        <div className="mt-10 text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">You might like</h2>
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {[
              { id: "website-starter", title: "Starter business website" },
              { id: "logo-design", title: "Professional logo design" },
              { id: "local-seo-setup", title: "Local SEO setup" },
              { id: "flexs-lead-campaign", title: "FLEXS lead campaign setup" },
            ].map((s) => (
              <li key={s.id}>
                <Link to="/marketplace/gigs/$id" params={{ id: s.id }} className="block px-4 py-3 text-sm hover:bg-secondary/40">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const tier = pkg.tiers[tierIdx];
  const addonsTotal = selectedAddons.reduce((s, i) => s + pkg.addons[i].priceCents, 0);
  const total = tier.priceCents + addonsTotal;
  const related = relatedPackages(pkg, 3);

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
        promoCode: promoCode ?? undefined,
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
      <CatalogSourceIndicator source={source} />
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

          <div className="rounded-xl border border-border overflow-hidden shadow-[var(--shadow-card)]">
            <ServiceThumbnail kind={pkg.thumb} />
          </div>
          {/* gallery strip — additional preview tiles */}
          <div className="grid grid-cols-4 gap-2">
            {([pkg.thumb, "branding", "seo", "social"] as const).slice(0, 4).map((k, i) => (
              <div
                key={i}
                className={`rounded-lg border overflow-hidden bg-card ${i === 0 ? "border-primary ring-1 ring-primary/30" : "border-border opacity-90 hover:opacity-100 transition-opacity"}`}
              >
                <ServiceThumbnail kind={k as never} />
              </div>
            ))}
          </div>

          {/* What you get */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">What you get</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Vetted TAKATAK freelancer match",
                "Managed kickoff & brief review",
                "Milestone-based delivery",
                "Source files & full ownership",
                "Escrow-protected payment",
                "Free revisions during the active project",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <Check size={14} className="text-primary mt-1 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* TAKATAK protection box */}
          <section className="brand-dark rounded-xl border border-white/10 p-5 flex items-start gap-3 relative overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--brand-accent-cyan), var(--brand-accent-violet), transparent)" }}
            />
            <ShieldCheck size={20} className="text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="font-semibold text-foreground">TAKATAK protection</div>
              <p className="mt-1 text-muted-foreground leading-relaxed">
                Your payment is held in escrow. TAKATAK reviews the delivery and only releases funds when you approve the work. If anything goes wrong, our team mediates and arranges a replacement freelancer at no extra cost.
              </p>
            </div>
          </section>

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

          {/* Related packages */}
          {related.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground">Related packages</h2>
              <ul className="mt-3 divide-y divide-border">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to="/marketplace/gigs/$id" params={{ id: r.id }}
                      className="flex items-center justify-between gap-3 py-3 hover:text-primary"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{r.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.categoryName} · {shortestDelivery(r)}-day delivery</div>
                      </div>
                      <div className="text-sm font-semibold text-foreground shrink-0">{formatStartingPrice(r)}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right: order summary */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-3">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
            <div className="brand-dark px-6 py-3 flex items-center justify-between text-xs font-semibold border-b border-white/10">
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <ShieldCheck size={13} className="text-primary" /> TAKATAK escrow order
              </span>
              <span className="text-muted-foreground">CAD</span>
            </div>
            <div className="p-6">
            <div className="text-xs text-muted-foreground">Selected tier · {tier.name}</div>
            <div className="mt-1 text-3xl font-bold text-foreground">{dollars(total)}</div>
            {pkg.intakeRequired && (
              <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-[11px] text-primary">
                Intake required — TAKATAK will collect a short brief before kickoff.
              </div>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground border-y border-border py-3">
              <span className="inline-flex items-center gap-1"><Clock size={12} /> {tier.deliveryDays} days</span>
              <span>·</span>
              <span>{tier.revisions} revisions</span>
              {selectedAddons.length > 0 && <><span>·</span><span>+{selectedAddons.length} add-on{selectedAddons.length === 1 ? "" : "s"}</span></>}
            </div>
            <div className="mt-3">
              <CheckoutPromoInput
                subtotalCents={total}
                onChange={(applied, c) => setPromoCode(applied ? c ?? null : null)}
              />
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
