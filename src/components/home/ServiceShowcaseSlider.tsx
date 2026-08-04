import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { pricing, formatCAD, cadenceLabel, type Cadence } from "@/lib/pricing";

interface Slide {
  key: string;
  title: string;
  benefit: string;
  amount: number;
  cadence: Cadence;
  to: string;
  cta: string;
  image: string;
  chips: readonly string[];
}

const SLIDES: readonly Slide[] = [
  { key: "websites", title: "Websites & ecommerce", benefit: "Designed, built and launched by our team. Payments, bookings and analytics included.", amount: pricing.websites[0].amount, cadence: "one-time", to: "/services/websites", cta: "Start a website", image: "/marketplace/visuals/website.jpg", chips: ["Starter", "Business", "Ecommerce"] },
  { key: "infra", title: "Domains & hosting", benefit: "Register, point and host on managed Canadian infrastructure with SSL and backups.", amount: pricing.hosting[0].amount, cadence: "monthly", to: "/hosting", cta: "View hosting", image: "/marketplace/visuals/seo.jpg", chips: [".ca / .com", "cPanel", "Daily backups"] },
  { key: "branding", title: "Logos & branding", benefit: "Identity systems built for real use — signage, packaging, social and web.", amount: pricing.branding[0].amount, cadence: "one-time", to: "/marketplace/category/logo_design", cta: "Start branding", image: "/marketplace/visuals/logo.jpg", chips: ["Logo", "Brand kit", "Guidelines"] },
  { key: "marketing", title: "Marketing & social media", benefit: "Campaign setup, creative and reporting handled by a managed growth team.", amount: pricing.marketing[0].amount, cadence: "one-time", to: "/services/marketing", cta: "Start marketing", image: "/marketplace/visuals/social.jpg", chips: ["Google Ads", "Meta", "Content"] },
  { key: "local", title: "QMAPS local visibility", benefit: "Get found on Maps and directories with verified, consistent business listings.", amount: pricing.local[0].amount, cadence: "one-time", to: "/services/local-listings", cta: "Improve visibility", image: "/marketplace/visuals/data.jpg", chips: ["Google Business", "Maps", "Directories"] },
  { key: "leads", title: "FLEXS lead generation", benefit: "Qualified local leads delivered to your pipeline, with tracking you can audit.", amount: pricing.leads[0].amount, cadence: "one-time", to: "/services/lead-generation", cta: "Get leads", image: "/marketplace/visuals/branding.jpg", chips: ["Funnels", "Tracking", "CRM sync"] },
  { key: "voip", title: "VoIP business phone", benefit: "Business numbers, IVR menus and call routing configured for your team.", amount: pricing.voip[0].amount, cadence: "monthly", to: "/services/voip", cta: "Set up VoIP", image: "/marketplace/visuals/mobile.jpg", chips: ["Numbers", "IVR", "Call routing"] },
  { key: "automation", title: "Automation & AI tools", benefit: "Connect your tools and remove manual work with monitored automations.", amount: pricing.ai[0].amount, cadence: "one-time", to: "/services/ai-business-tools", cta: "Automate work", image: "/marketplace/visuals/automation.jpg", chips: ["Integrations", "Workflows", "Assistants"] },
];

export function ServiceShowcaseSlider() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback((next: number) => setIndex((next + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (!playing) return;
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [playing]);

  const slide = SLIDES[index]!;

  return (
    <section
      className="border-b border-border bg-background"
      aria-roledescription="carousel"
      aria-label="TAKATAK service showcase"
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <h2 className="min-w-0 text-2xl font-bold text-foreground md:text-3xl">What we build and run for businesses</h2>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause slideshow" : "Play slideshow"} className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground">
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous service" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next service" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          tabIndex={0}
          role="group"
          aria-label={`${slide.title} — slide ${index + 1} of ${SLIDES.length}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
          }}
          onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
          onTouchEnd={(e) => {
            const start = touchX.current;
            const end = e.changedTouches[0]?.clientX;
            if (start != null && end != null && Math.abs(end - start) > 45) go(index + (end < start ? 1 : -1));
            touchX.current = null;
          }}
          className="mt-7 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
            <div className="order-2 flex flex-col justify-center gap-4 p-6 md:p-10 lg:order-1">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <BadgeCheck size={11} /> Managed by TAKATAK
              </span>
              <h3 key={slide.key} className="animate-fade-in text-2xl font-bold text-foreground md:text-3xl">{slide.title}</h3>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">{slide.benefit}</p>
              <p className="text-lg font-bold text-foreground">
                from {formatCAD(slide.amount)}
                <span className="text-xs font-medium text-muted-foreground">{cadenceLabel(slide.cadence)} CAD</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {slide.chips.map((c) => (
                  <span key={c} className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">{c}</span>
                ))}
              </div>
              <Link to={slide.to as never} className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                {slide.cta} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="order-1 relative min-h-[220px] overflow-hidden border-b border-border lg:order-2 lg:border-b-0 lg:border-l">
              <img
                key={slide.image}
                src={slide.image}
                alt={`${slide.title} work sample`}
                loading="lazy"
                className="animate-fade-in h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${s.title}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-primary" : "w-4 bg-border hover:bg-muted-foreground/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}