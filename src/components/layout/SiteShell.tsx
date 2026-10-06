import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function SiteShell({ children, flushFooter = false }: { children: ReactNode; flushFooter?: boolean }) {
  return (
    <div className="tk-canvas min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <SiteFooter flush={flushFooter} />
    </div>
  );
}