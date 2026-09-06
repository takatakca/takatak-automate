import type { CSSProperties, ReactNode } from "react";
import { motion } from "@/lib/motionConfig";

/**
 * Shared furniture for the business-path worlds: one depth language, one
 * reveal behaviour, one surface material.
 */

export function Beat({
  show,
  children,
  className = "",
  from = "up",
  style,
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
  from?: "up" | "down" | "left" | "right" | "scale";
  style?: CSSProperties;
}) {
  const hidden: Record<string, string> = {
    up: "translateY(14px)",
    down: "translateY(-14px)",
    left: "translateX(-16px)",
    right: "translateX(16px)",
    scale: "scale(0.94)",
  };
  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "none" : hidden[from],
        transition: `opacity ${motion.duration.base}ms ${motion.ease}, transform ${motion.duration.base}ms ${motion.ease}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Midground scene surface: matte glass belonging to the active world. */
export function SceneSurface({
  children,
  className = "",
  depth = "mid",
}: {
  children: ReactNode;
  className?: string;
  depth?: "back" | "mid" | "front";
}) {
  const shadow =
    depth === "front"
      ? "shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)]"
      : depth === "mid"
        ? "shadow-[0_28px_70px_-46px_rgba(0,0,0,0.9)]"
        : "shadow-none";
  const surface =
    depth === "back"
      ? "border-white/8 bg-white/[0.02]"
      : depth === "mid"
        ? "border-white/12 bg-white/[0.05]"
        : "border-primary/35 bg-[color-mix(in_oklab,var(--brand-dark-2)_88%,transparent)]";
  return <div className={`rounded-2xl border ${surface} ${shadow} backdrop-blur-sm ${className}`}>{children}</div>;
}

export function SceneLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{children}</span>
  );
}

/** Foreground status chip for the closing beat of each world. */
export function WorldStatus({ show, label }: { show: boolean; label: string }) {
  return (
    <Beat show={show} from="scale" className="absolute bottom-3 right-3 z-20">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/45 bg-[color-mix(in_oklab,var(--brand-dark-2)_82%,transparent)] px-3 py-1.5 text-[11px] font-semibold text-primary shadow-[0_18px_44px_-24px_rgba(0,0,0,0.95)]">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        {label}
      </span>
    </Beat>
  );
}
