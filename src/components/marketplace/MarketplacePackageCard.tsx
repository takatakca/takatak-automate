import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { MarketplacePackage } from "@/lib/marketplace";
import { ServiceThumbnail } from "./ServiceThumbnail";
import { thumbForCategory } from "@/lib/serviceVisuals";

export function MarketplacePackageCard({ pkg }: { pkg: MarketplacePackage }) {
  const price = (pkg.priceCents / 100).toLocaleString(undefined, {
    style: "currency", currency: pkg.currency || "CAD",
  });
  return (
    <Link
      to="/marketplace/gigs/$id"
      params={{ id: pkg.id }}
      className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
    >
      <ServiceThumbnail kind={thumbForCategory(pkg.category)} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{pkg.category.replace(/_/g, " ")}</div>
        <h4 className="mt-1 font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{pkg.title}</h4>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">{pkg.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Star size={12} className="fill-warning text-warning" /> New
          </span>
          <span className="text-sm font-semibold">{price}</span>
        </div>
      </div>
    </Link>
  );
}