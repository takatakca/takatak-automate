import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Clock, ShieldCheck, MessageSquare } from "lucide-react";
import { ServiceThumbnail } from "@/components/marketplace/ServiceThumbnail";

export const Route = createFileRoute("/marketplace/gigs/$id")({
  head: () => ({ meta: [{ title: "Service — TAKATAK Marketplace" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/marketplace" className="text-xs text-muted-foreground hover:text-foreground">← Back to marketplace</Link>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
        <div className="space-y-6">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Service preview</div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Service #{id}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star size={14} className="fill-foreground text-foreground" />
            <span className="font-semibold text-foreground">New listing</span>
            <span>·</span>
            <span>TAKATAK verified freelancer</span>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <ServiceThumbnail kind="website" />
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">About this service</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Full package details, deliverables and add-ons will appear here once the freelancer publishes this listing. In the meantime, post a custom project and TAKATAK will match you with a vetted freelancer within 24 hours.
            </p>
            <ul className="mt-4 grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-foreground">
              <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-primary" /> Escrow protection</li>
              <li className="flex items-center gap-2"><Clock size={14} className="text-primary" /> Delivery in 3–7 days</li>
              <li className="flex items-center gap-2"><MessageSquare size={14} className="text-primary" /> Direct chat with freelancer</li>
              <li className="flex items-center gap-2"><Star size={14} className="text-primary" /> Free revisions on request</li>
            </ul>
          </div>
        </div>
        <aside className="lg:sticky lg:top-24 h-fit rounded-xl border border-border bg-card p-6">
          <div className="text-xs text-muted-foreground">Starting at</div>
          <div className="mt-1 text-3xl font-bold text-foreground">$—</div>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground border-y border-border py-3">
            <span className="inline-flex items-center gap-1"><Clock size={12} /> 5 days</span>
            <span>·</span>
            <span>2 revisions</span>
          </div>
          <Link
            to="/marketplace/post-project"
            className="mt-4 block text-center px-4 py-2.5 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90"
          >
            Request this service
          </Link>
          <Link
            to="/marketplace/post-project"
            className="mt-2 block text-center px-4 py-2.5 rounded-md text-sm font-semibold text-foreground border border-border hover:bg-secondary"
          >
            Contact freelancer
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Payment is held by TAKATAK and only released after you approve the delivery.
          </p>
        </aside>
      </div>
    </div>
  );
}