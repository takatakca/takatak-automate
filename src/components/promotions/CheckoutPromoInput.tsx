import { useEffect, useState } from "react";
import { Tag, Check } from "lucide-react";
import {
  PROMO_CODE,
  getPromoState,
  previewDiscount,
  previewPromoBackend,
  trackPromo,
} from "@/lib/promotions";

interface Props {
  subtotalCents: number;
  onChange?: (applied: boolean, code?: string | null) => void;
}

export function CheckoutPromoInput({ subtotalCents, onChange }: Props) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [serverPreview, setServerPreview] = useState<{ discountCents: number; totalCents: number } | null>(null);

  useEffect(() => {
    const s = getPromoState();
    if (s.status === "claimed") {
      setCode(PROMO_CODE);
      setApplied(true);
      onChange?.(true, PROMO_CODE);
      trackPromo("promo_applied_to_checkout", { auto: true });
    }
  }, [onChange]);

  // Refresh server preview whenever subtotal changes and a promo is applied.
  useEffect(() => {
    if (!applied) { setServerPreview(null); return; }
    let cancelled = false;
    void previewPromoBackend({ code: PROMO_CODE, subtotalCents }).then((r) => {
      if (cancelled) return;
      if (r) setServerPreview({ discountCents: r.discountCents, totalCents: r.totalCents });
    });
    return () => { cancelled = true; };
  }, [applied, subtotalCents]);

  const apply = async () => {
    const c = code.trim().toUpperCase();
    const s = getPromoState();
    if (c !== PROMO_CODE) {
      setMsg("That code isn't recognized.");
      setApplied(false);
      onChange?.(false, null);
      return;
    }
    if (s.status === "used") {
      setMsg("This offer has already been used on a previous order.");
      setApplied(false);
      onChange?.(false, null);
      return;
    }
    if (s.status !== "claimed") {
      setMsg("Sign in and verify your account to activate this offer.");
      setApplied(false);
      onChange?.(false, null);
      return;
    }
    setApplied(true);
    setMsg(null);
    onChange?.(true, PROMO_CODE);
    trackPromo("promo_applied_to_checkout", { auto: false });
  };

  const local = previewDiscount(subtotalCents);
  const discountCents = serverPreview?.discountCents ?? local.discountCents;
  const totalCents = serverPreview?.totalCents ?? local.totalCents;
  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Tag size={15} className="text-primary" /> Promo code
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm uppercase"
        />
        <button
          onClick={apply}
          type="button"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
        >
          Apply
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-muted-foreground">{msg}</p>}
      {applied && (
        <div className="mt-3 rounded-md bg-primary/10 border border-primary/30 p-3 text-xs text-foreground">
          <p className="font-semibold inline-flex items-center gap-1.5">
            <Check size={14} className="text-primary" /> FIRST10 ready to apply
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <div className="text-muted-foreground">Subtotal</div>
              <div className="font-medium text-foreground">{fmt(subtotalCents)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Discount (preview)</div>
              <div className="font-medium text-primary">−{fmt(discountCents)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Estimated total</div>
              <div className="font-semibold text-foreground">{fmt(totalCents)}</div>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Final total is calculated by TAKATAK at checkout.
          </p>
        </div>
      )}
    </div>
  );
}