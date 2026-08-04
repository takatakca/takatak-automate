import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, Gift } from "lucide-react";
import {
  dismissStickyPromo,
  getPromoState,
  isStickyPromoDismissed,
  trackPromo,
} from "@/lib/promotions";
import { useLanguage } from "@/hooks/useLanguage";

export function PromoStickyCard() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [show, setShow] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (isStickyPromoDismissed()) return;
    const s = getPromoState();
    if (s.status === "claimed" || s.status === "used") return;
    const onScroll = () => {
      if (window.scrollY > 600) {
        setShow(true);
        trackPromo("promo_banner_viewed", { surface: "sticky_card" });
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const allowed = pathname === "/" || pathname.startsWith("/marketplace");
  if (!show || !allowed) return null;

  const dismiss = () => { dismissStickyPromo(); setShow(false); };

  return (
    <div
      role="complementary"
      aria-label={t("promo.card.aria")}
      className="fixed z-40 left-3 right-3 bottom-20 sm:left-auto sm:right-5 sm:bottom-24 sm:w-[340px] rounded-xl border border-border bg-card shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] p-4"
    >
      <button
        aria-label={t("promo.card.dismiss")}
        onClick={dismiss}
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Gift size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{t("promo.card.title")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("promo.card.body")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Link
          to="/signup"
          search={{ promo: "FIRST10" } as never}
          onClick={() => trackPromo("promo_banner_clicked", { surface: "sticky_card" })}
          className="flex-1 text-center px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
        >
          {t("promo.card.cta")}
        </Link>
        <button
          onClick={dismiss}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {t("promo.card.later")}
        </button>
      </div>
    </div>
  );
}