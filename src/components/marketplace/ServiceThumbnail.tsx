import {
  Globe2, Smartphone, Palette, Layers, Share2, Search,
  ClipboardList, Utensils, Image as ImageIcon, Store, Workflow, Bot,
} from "lucide-react";

type Kind =
  | "website" | "mobile" | "logo" | "branding" | "social" | "seo"
  | "data" | "menu" | "flyer" | "ecommerce" | "automation" | "ai";

const META: Record<Kind, { icon: typeof Globe2; tint: string; label: string }> = {
  website: { icon: Globe2, tint: "oklch(0.96 0.03 195)", label: "Web" },
  mobile: { icon: Smartphone, tint: "oklch(0.95 0.04 280)", label: "App" },
  logo: { icon: Palette, tint: "oklch(0.95 0.04 50)", label: "Logo" },
  branding: { icon: Layers, tint: "oklch(0.94 0.05 20)", label: "Brand" },
  social: { icon: Share2, tint: "oklch(0.95 0.05 340)", label: "Social" },
  seo: { icon: Search, tint: "oklch(0.95 0.05 155)", label: "SEO" },
  data: { icon: ClipboardList, tint: "oklch(0.95 0.03 240)", label: "Data" },
  menu: { icon: Utensils, tint: "oklch(0.94 0.05 70)", label: "Menu" },
  flyer: { icon: ImageIcon, tint: "oklch(0.95 0.05 0)", label: "Flyer" },
  ecommerce: { icon: Store, tint: "oklch(0.95 0.04 145)", label: "Shop" },
  automation: { icon: Workflow, tint: "oklch(0.94 0.04 220)", label: "Flow" },
  ai: { icon: Bot, tint: "oklch(0.94 0.05 300)", label: "AI" },
};

/**
 * Clean, marketplace-style thumbnail rendered with CSS only.
 * No copyrighted imagery, no AI gradient blobs — a flat tinted canvas
 * with a subtle dotted texture and a single category icon mark.
 */
export function ServiceThumbnail({ kind }: { kind: Kind }) {
  const { icon: Icon, tint, label } = META[kind];
  return (
    <div
      className="relative aspect-[5/3] w-full overflow-hidden border-b border-border"
      style={{ backgroundColor: tint }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(oklch(0.18 0.02 260 / 0.08) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-background/85 backdrop-blur-sm border border-border shadow-sm">
          <Icon size={28} className="text-foreground" strokeWidth={1.6} />
        </div>
      </div>
      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-background/85 backdrop-blur-sm border border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}