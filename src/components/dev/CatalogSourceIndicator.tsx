import type { CatalogSource } from "@/lib/marketplaceCatalogApi";

/** Dev-only badge that shows whether the marketplace catalog was served by
 *  the backend API or by the static frontend fallback. Hidden in production
 *  builds via `import.meta.env.DEV`. */
export function CatalogSourceIndicator({ source }: { source?: CatalogSource }) {
  if (!import.meta.env.DEV || !source) return null;
  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-50 rounded-md border border-border bg-background/90 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground shadow-sm backdrop-blur">
      Catalog: {source}
    </div>
  );
}