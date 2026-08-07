import { forwardRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";

const BASE =
  "group inline-flex shrink-0 items-center gap-1.5 rounded-md border border-primary/45 bg-primary/5 px-3 py-2 text-[13px] font-semibold text-foreground transition-all hover:border-primary/70 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 whitespace-nowrap";
const COMPACT =
  "grid h-10 w-10 place-items-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";

interface CommonProps {
  label: string;
  tooltip: string;
  icon: LucideIcon;
  compact?: boolean;
  /** One-shot entrance animation utility class (no endless pulsing). */
  introClass?: string;
  showArrow?: boolean;
}

function Inner({ label, icon: Icon, compact, introClass, showArrow }: CommonProps): ReactNode {
  return (
    <>
      <Icon
        size={15}
        className={`text-primary transition-transform group-hover:scale-110 ${introClass ?? ""}`}
      />
      {!compact && label}
      {!compact && showArrow !== false && (
        <ArrowRight
          size={13}
          aria-hidden
          className="-ml-1 w-0 opacity-0 text-primary transition-all duration-200 group-hover:ml-0 group-hover:w-3 group-hover:opacity-100"
        />
      )}
    </>
  );
}

/** Header product shortcut rendered as a route link (QMAPS, FLEXS). */
export function HeaderProductLink({ to, ...props }: CommonProps & { to: string }) {
  return (
    <Link
      to={to}
      aria-label={`${props.label} — ${props.tooltip}`}
      title={props.tooltip}
      className={props.compact ? COMPACT : BASE}
    >
      <Inner {...props} />
    </Link>
  );
}

/** Header product shortcut rendered as a button (opens a panel). */
export const HeaderProductButton = forwardRef<
  HTMLButtonElement,
  CommonProps & { onClick: () => void; expanded?: boolean }
>(function HeaderProductButton({ onClick, expanded, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-label={`${props.label} — ${props.tooltip}`}
      title={props.tooltip}
      className={props.compact ? COMPACT : BASE}
    >
      <Inner {...props} />
    </button>
  );
});
