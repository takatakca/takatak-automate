import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gift, ArrowRight } from "lucide-react";
import { getPromoState, type PromoState } from "@/lib/promotions";

export function DashboardPromoCard() {
  const [state, setState] = useState<PromoState | null>(null);
  useEffect(() => setState(getPromoState()), []);
  if (!state) return null;
  if (state.status === "used" || state.status === "dismissed" || state.status === "none") return null;

  const ready = state.status === "claimed";
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
        <Gift size={20} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">
          {ready ? "Your 10% first-service offer is available." : "Your 10% first-service offer is saved."}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {ready
            ? "Apply code FIRST10 at checkout on your first eligible TAKATAK service."
            : "Verify your account to activate the credit on your first eligible order."}
        </p>
      </div>
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
      >
        Browse services <ArrowRight size={14} />
      </Link>
    </div>
  );
}