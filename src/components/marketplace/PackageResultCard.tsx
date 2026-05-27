import { Link } from "@tanstack/react-router";
import { Star, Clock, ShieldCheck } from "lucide-react";
import { ServiceThumbnail } from "./ServiceThumbnail";
import {
  type MarketplacePackageDetail,
  formatStartingPrice,
  shortestDelivery,
} from "@/lib/marketplacePackages";

export function PackageResultCard({ pkg }: { pkg: MarketplacePackageDetail }) {
  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all">
      <Link to="/marketplace/gigs/$id" params={{ id: pkg.id }} className="block">
        <ServiceThumbnail kind={pkg.thumb} />
      </Link>
      <div className="flex flex-col flex-1 p-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {pkg.categoryName}
        </div>
        <Link
          to="/marketplace/gigs/$id"
          params={{ id: pkg.id }}
          className="mt-1 font-semibold text-foreground leading-snug line-clamp-2 hover:text-primary"
        >
          {pkg.title}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{pkg.blurb}</p>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-foreground font-medium">
            <Star size={12} className="fill-foreground" />
            {pkg.rating.toFixed(1)}
          </span>
          <span>({pkg.reviews})</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {shortestDelivery(pkg)}-day delivery
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Starting at</div>
            <div className="text-base font-bold text-foreground">{formatStartingPrice(pkg)}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/marketplace/post-project"
              className="px-3 py-1.5 rounded-md text-xs font-semibold border border-border hover:bg-secondary"
            >
              Request quote
            </Link>
            <Link
              to="/marketplace/gigs/$id"
              params={{ id: pkg.id }}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90"
            >
              View
            </Link>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <ShieldCheck size={11} className="text-primary" />
          TAKATAK-managed · payment released after approval
        </div>
      </div>
    </article>
  );
}
