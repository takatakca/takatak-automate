import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { PROMO_CODE } from "@/lib/promotions";
import { getAuthToken } from "@/lib/auth-store";
import { pathPrice, type BusinessPath } from "@/lib/businessPaths";

/**
 * Sales panel for the active business path. Outcome first, visual second,
 * price third, CTA fourth. Prices are individual starting points read from
 * centralized pricing — never invented bundles.
 */
export function PathSalesPanel({ path }: { path: BusinessPath }) {
  const { tx, lang } = useLanguage();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getAuthToken()));
  }, []);

  const primarySearch = authed
    ? undefined
    : ({ next: path.primary.to, service: path.serviceKey, stage: path.key, lang, source: "pricing-gateways" } as Record<string, string>);

  return (
    <div className="relative rounded-3xl border border-white/12 bg-[color-mix(in_oklab,var(--brand-dark-2)_84%,transparent)] p-5 shadow-[0_36px_90px_-52px_rgba(0,0,0,0.95)] backdrop-blur-md sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{tx(path.eyebrow)}</p>
      <h3 className="mt-2 text-xl font-bold leading-tight text-foreground sm:text-2xl">{tx(path.headline)}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{tx(path.support)}</p>

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {tx({ en: "Starting points", fr: "Points de départ" })}
      </p>
      <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {path.starting.map((s) => (
          <li key={s.to + s.label.en} className="flex items-baseline justify-between gap-3 border-b border-white/8 py-1.5">
            <Link
              to={s.to as never}
              className="text-sm font-medium text-foreground/90 underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {tx(s.label)}
            </Link>
            <span className="shrink-0 text-xs text-muted-foreground">{pathPrice(s, lang === "fr" ? "fr" : "en")}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          to={(authed ? path.primary.to : "/signup") as never}
          search={primarySearch as never}
          className="group/cta inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {tx(path.primary.label)}
          <ArrowRight size={14} className="transition-transform duration-300 group-hover/cta:translate-x-1" />
        </Link>
        <Link
          to={path.secondary.to as never}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {tx(path.secondary.label)}
        </Link>
      </div>

      {!authed && (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
          <span>
            {tx({
              en: "New to TAKATAK? Your welcome offer may apply.",
              fr: "Nouveau chez TAKATAK ? Votre offre de bienvenue peut s'appliquer.",
            })}
          </span>
          <Link
            to={"/signup" as never}
            search={
              {
                promo: PROMO_CODE,
                service: path.serviceKey,
                stage: path.key,
                next: path.primary.to,
                lang,
                source: "pricing-gateways",
              } as never
            }
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {tx({ en: "Claim my offer", fr: "Réclamer mon offre" })}
          </Link>
        </p>
      )}
    </div>
  );
}
