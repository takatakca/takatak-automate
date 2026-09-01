import { useLanguage } from "@/hooks/useLanguage";

const STEPS = [
  "fnd.flow.name",
  "fnd.flow.domain",
  "fnd.flow.dns",
  "fnd.flow.hosting",
  "fnd.flow.ssl",
  "fnd.flow.website",
  "fnd.flow.online",
] as const;

/**
 * The business story, told as a path instead of a paragraph:
 * business name → domain → DNS → hosting → SSL → website → business online.
 * Horizontal on desktop, vertical on mobile. Decorative connectors only.
 */
export function FoundationFlow({ reached = 0 }: { reached?: number }) {
  const { t } = useLanguage();
  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1.5">
      {STEPS.map((key, i) => {
        const active = i <= reached;
        return (
          <li key={key} className="flex items-center gap-1.5 sm:gap-1">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors duration-300 ${
                active
                  ? "border-primary/45 bg-primary/10 text-foreground"
                  : "border-border bg-background/60 text-muted-foreground"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-primary" : "bg-muted-foreground/40"}`} />
              {t(key)}
            </span>
            {i < STEPS.length - 1 && (
              <span aria-hidden className="ml-1 hidden h-px w-4 bg-border sm:block" />
            )}
            {i < STEPS.length - 1 && (
              <span aria-hidden className="ml-2 block h-3 w-px bg-border sm:hidden" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
