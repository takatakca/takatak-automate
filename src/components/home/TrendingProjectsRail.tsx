import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { ServiceThumbnail } from "@/components/marketplace/ServiceThumbnail";
import { getPackage, formatStartingPrice } from "@/lib/marketplacePackages";
import { useLanguage } from "@/hooks/useLanguage";
import { Reveal } from "@/components/motion/Reveal";

/** Real catalogue packages only — no invented ratings, totals or urgency. */
const IDS = [
  "website-starter",
  "logo-design",
  "menu-design",
  "local-seo-setup",
  "social-content-pack",
  "lead-funnel",
  "workflow-automation",
  "brand-identity-kit",
] as const;

const LABELS = [
  { en: "Featured by TAKATAK", fr: "En vedette chez TAKATAK" },
  { en: "Business-ready", fr: "Prêt pour les affaires" },
  { en: "Managed delivery", fr: "Livraison encadrée" },
  { en: "Popular starting point", fr: "Point de départ populaire" },
] as const;

export function TrendingProjectsRail() {
  const { tx } = useLanguage();
  const trackRef = useRef<HTMLUListElement>(null);
  const packages = IDS.map((id) => getPackage(id)).filter(Boolean);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="relative border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <Reveal className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              {tx({ en: "Trending on TAKATAK", fr: "Tendances sur TAKATAK" })}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tx({ en: "Managed projects businesses start with most.", fr: "Les projets gérés que les entreprises choisissent le plus." })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/marketplace" className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:inline-flex">
              {tx({ en: "Browse all", fr: "Tout parcourir" })} <ArrowRight size={14} aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label={tx({ en: "Scroll left", fr: "Défiler à gauche" })}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label={tx({ en: "Scroll right", fr: "Défiler à droite" })}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>
        </Reveal>

        <ul
          ref={trackRef}
          className="tk-no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {packages.map((p, i) => (
            <li key={p!.id} className="w-[236px] shrink-0 snap-start sm:w-[262px]">
              <Link
                to="/marketplace/gigs/$id"
                params={{ id: p!.id }}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.05]">
                    <ServiceThumbnail kind={p!.thumb} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    <BadgeCheck size={10} aria-hidden /> {tx(LABELS[i % LABELS.length]!)}
                  </span>
                  <h3 className="mt-2.5 line-clamp-2 text-sm font-semibold leading-5 text-foreground">{p!.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{p!.categoryName}</p>
                  <span className="mt-auto pt-3 text-sm font-bold text-foreground">{formatStartingPrice(p!)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}