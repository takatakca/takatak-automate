import { Link } from "@tanstack/react-router";
import {
  Globe2, Smartphone, Palette, Share2, Search, Workflow,
  ClipboardList, Image as ImageIcon,
} from "lucide-react";

const SERVICES = [
  { slug: "website_design", title: "Website Development", icon: Globe2, price: "from $180", tag: "Most popular" },
  { slug: "mobile_app_design", title: "Mobile App Design", icon: Smartphone, price: "from $250" },
  { slug: "logo_design", title: "Logo Design", icon: Palette, price: "from $25", tag: "Trending" },
  { slug: "social_media_content", title: "Social Media Content", icon: Share2, price: "from $40" },
  { slug: "seo_local_visibility", title: "SEO & Local Visibility", icon: Search, price: "from $99" },
  { slug: "automation_setup", title: "Automation Setup", icon: Workflow, price: "from $120" },
  { slug: "data_entry", title: "Data Entry", icon: ClipboardList, price: "from $20" },
  { slug: "flyer_design", title: "Menu / Flyer Design", icon: ImageIcon, price: "from $30" },
];

export function PopularServicesGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {SERVICES.map((s) => {
        const Icon = s.icon;
        return (
          <Link
            key={s.slug}
            to="/marketplace/category/$slug"
            params={{ slug: s.slug }}
            className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:-translate-y-0.5 transition-all shadow-[var(--shadow-card)]"
          >
            <div className="relative h-32 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
              <div className="absolute inset-0 opacity-90" style={{ background: "var(--gradient-hero)" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon size={40} className="text-primary-foreground/90" strokeWidth={1.5} />
              </div>
              {s.tag && (
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-card text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {s.tag}
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{s.title}</h3>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{s.price}</span>
                <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">Browse →</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}