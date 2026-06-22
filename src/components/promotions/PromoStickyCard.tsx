import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, Gift } from "lucide-react";
import {
  dismissStickyPromo,
  getPromoState,
  isStickyPromoDismissed,
  trackPromo,
} from "@/lib/promotions";

export function PromoStickyCard() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [show, setShow] = useState(false);

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
      aria-label="First service offer"
      className="fixed z-40 left-3 right-3 bottom-3 sm:left-auto sm:right-5 sm:bottom-5 sm:w-[340px] rounded-xl border border-border bg-card shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] p-4"
    >
      <button
        aria-label="Dismiss"
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
          <p className="text-sm font-semibold text-foreground">New client offer</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Create an account and your 10% first-service credit is saved in your TAKATAK dashboard.
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
          Create account and claim 10%
        </Link>
        <button
          onClick={dismiss}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Not now
        </button>
      </div>
    </div>
  );
}