import { Link } from "@tanstack/react-router";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplaceCategories";
import {
  Palette, Globe2, Smartphone, Layers, FileText, ListChecks,
  ClipboardList, Headphones, Share2, Megaphone, Search, Workflow,
  Bot, PenLine, Utensils, Image as ImageIcon, Store,
} from "lucide-react";

const ICONS: Record<string, typeof Palette> = {
  logo_design: Palette,
  website_design: Globe2,
  mobile_app_design: Smartphone,
  branding: Layers,
  business_card_design: FileText,
  page_layout: ListChecks,
  data_entry: ClipboardList,
  virtual_assistance: Headphones,
  social_media_content: Share2,
  online_advertising: Megaphone,
  seo_local_visibility: Search,
  automation_setup: Workflow,
  ai_tool_setup: Bot,
  content_writing: PenLine,
  menu_design: Utensils,
  flyer_design: ImageIcon,
  ecommerce_setup: Store,
};

export function MarketplaceCategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {MARKETPLACE_CATEGORIES.map((c) => {
        const Icon = ICONS[c.slug] ?? Store;
        return (
          <Link
            key={c.slug}
            to="/marketplace/category/$slug"
            params={{ slug: c.slug }}
            className="group relative rounded-xl border border-border bg-card p-4 overflow-hidden hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div
              aria-hidden
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"
              style={{ background: "var(--gradient-hero)" }}
            />
            <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-secondary/40 group-hover:border-primary/40">
              <Icon size={18} className="text-primary transition-transform group-hover:scale-110" />
            </div>
            <div className="relative mt-3 font-medium text-sm">{c.name}</div>
            <div className="relative mt-1 text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">Browse packages →</div>
          </Link>
        );
      })}
    </div>
  );
}