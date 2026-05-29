type Kind =
  | "website" | "mobile" | "logo" | "branding" | "social" | "seo"
  | "data" | "menu" | "flyer" | "ecommerce" | "automation" | "ai";

/**
 * Marketplace thumbnails rendered as pure-CSS/SVG mockups.
 * No copyrighted imagery, no AI gradient blobs — each kind shows a
 * realistic representation of the deliverable (browser window, phone,
 * logo board, social post, SEO chart, data table, menu card, flyer…).
 */
export function ServiceThumbnail({ kind }: { kind: Kind }) {
  return (
    <div className="relative aspect-[5/3] w-full overflow-hidden border-b border-border bg-secondary">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Mockup kind={kind} />
      </div>
    </div>
  );
}

function Mockup({ kind }: { kind: Kind }) {
  switch (kind) {
    case "website":
      return <BrowserMock />;
    case "ecommerce":
      return <BrowserMock variant="shop" />;
    case "mobile":
      return <PhoneMock />;
    case "logo":
      return <LogoBoard />;
    case "branding":
      return <BrandingBoard />;
    case "social":
      return <SocialPost />;
    case "seo":
      return <SeoChart />;
    case "data":
      return <DataTable />;
    case "menu":
      return <MenuCard />;
    case "flyer":
      return <FlyerCard />;
    case "automation":
      return <AutomationFlow />;
    case "ai":
      return <ChatMock />;
  }
}

/* -------- Shared atoms -------- */
const bar = "rounded-[2px] bg-foreground/15";

function BrowserMock({ variant }: { variant?: "shop" }) {
  return (
    <div className="w-full h-full bg-card rounded-md shadow-[0_6px_18px_-10px_rgba(0,0,0,0.25)] border border-border overflow-hidden flex flex-col">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-border bg-secondary/60">
        <span className="w-2 h-2 rounded-full bg-foreground/20" />
        <span className="w-2 h-2 rounded-full bg-foreground/20" />
        <span className="w-2 h-2 rounded-full bg-foreground/20" />
        <span className="ml-2 h-2.5 flex-1 rounded-sm bg-foreground/10" />
      </div>
      {variant === "shop" ? (
        <div className="p-2 grid grid-cols-3 gap-1.5 flex-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-sm bg-secondary border border-border flex flex-col">
              <div className="flex-1 bg-foreground/8" />
              <div className="p-1 space-y-0.5">
                <span className={`block h-1 w-3/4 ${bar}`} />
                <span className="block h-1.5 w-1/3 rounded-[2px] bg-primary/70" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-2.5 flex-1 flex flex-col gap-1.5">
          <span className={`h-2 w-2/3 ${bar}`} />
          <span className={`h-1.5 w-5/6 ${bar}`} />
          <span className={`h-1.5 w-3/4 ${bar}`} />
          <div className="mt-1.5 grid grid-cols-3 gap-1.5 flex-1">
            <div className="rounded-sm bg-foreground/8" />
            <div className="rounded-sm bg-foreground/8" />
            <div className="rounded-sm bg-primary/20" />
          </div>
          <span className="mt-1 h-3 w-14 rounded-sm bg-primary" />
        </div>
      )}
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="h-full aspect-[9/16] bg-foreground rounded-[14px] p-1 shadow-[0_8px_22px_-10px_rgba(0,0,0,0.35)]">
      <div className="h-full w-full bg-card rounded-[10px] overflow-hidden flex flex-col">
        <div className="h-3 flex items-center justify-center">
          <span className="w-6 h-1 rounded-full bg-foreground/40" />
        </div>
        <div className="px-1.5 space-y-1 flex-1">
          <div className="h-4 rounded-sm bg-primary/80" />
          <div className="grid grid-cols-3 gap-1">
            <div className="aspect-square rounded-sm bg-secondary border border-border" />
            <div className="aspect-square rounded-sm bg-secondary border border-border" />
            <div className="aspect-square rounded-sm bg-secondary border border-border" />
          </div>
          <div className="h-1.5 rounded-sm bg-foreground/10 w-3/4" />
          <div className="h-1.5 rounded-sm bg-foreground/10 w-1/2" />
        </div>
        <div className="h-2 flex items-center justify-center gap-1 pb-0.5">
          <span className="w-1 h-1 rounded-full bg-foreground/30" />
          <span className="w-1 h-1 rounded-full bg-foreground/30" />
          <span className="w-1 h-1 rounded-full bg-foreground/30" />
        </div>
      </div>
    </div>
  );
}

function LogoBoard() {
  const marks = ["T", "A", "K", "★", "◆", "●"];
  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-2 gap-1.5">
      {marks.map((m, i) => (
        <div
          key={i}
          className="rounded-md bg-card border border-border flex items-center justify-center font-bold text-foreground"
          style={{ fontSize: 18 }}
        >
          <span className={i % 2 ? "text-primary" : "text-foreground"}>{m}</span>
        </div>
      ))}
    </div>
  );
}

function BrandingBoard() {
  return (
    <div className="w-full h-full bg-card rounded-md border border-border p-2 flex flex-col gap-1.5">
      <div className="grid grid-cols-4 gap-1 h-6">
        <div className="rounded-sm bg-primary" />
        <div className="rounded-sm bg-foreground" />
        <div className="rounded-sm bg-foreground/30" />
        <div className="rounded-sm bg-secondary border border-border" />
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="font-extrabold text-foreground leading-none" style={{ fontSize: 22 }}>Aa</div>
        <span className={`mt-1.5 h-1.5 w-2/3 ${bar}`} />
        <span className={`mt-1 h-1 w-1/2 ${bar}`} />
      </div>
    </div>
  );
}

function SocialPost() {
  return (
    <div className="h-full aspect-square bg-card rounded-md border border-border overflow-hidden flex flex-col shadow-sm">
      <div className="flex items-center gap-1.5 p-1.5 border-b border-border">
        <span className="w-3 h-3 rounded-full bg-primary" />
        <span className={`h-1.5 w-12 ${bar}`} />
      </div>
      <div className="flex-1 bg-foreground/8 flex items-center justify-center">
        <span className="text-primary font-bold" style={{ fontSize: 26 }}>#</span>
      </div>
      <div className="p-1.5 space-y-1">
        <span className={`block h-1 w-5/6 ${bar}`} />
        <span className={`block h-1 w-3/5 ${bar}`} />
      </div>
    </div>
  );
}

function SeoChart() {
  const heights = [25, 35, 30, 50, 60, 75, 90];
  return (
    <div className="w-full h-full bg-card rounded-md border border-border p-2 flex flex-col">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`h-1.5 w-12 ${bar}`} />
        <span className="px-1 py-0.5 rounded text-[8px] font-bold text-primary bg-primary/10">+38%</span>
      </div>
      <div className="flex-1 flex items-end gap-1">
        {heights.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t ${i === heights.length - 1 ? "bg-primary" : "bg-foreground/25"}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function DataTable() {
  return (
    <div className="w-full h-full bg-card rounded-md border border-border overflow-hidden flex flex-col">
      <div className="grid grid-cols-4 gap-px bg-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-secondary px-1 py-1">
            <span className={`block h-1 w-3/4 ${bar}`} />
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-rows-5 gap-px bg-border">
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r} className="grid grid-cols-4 gap-px bg-border">
            {Array.from({ length: 4 }).map((_, c) => (
              <div key={c} className="bg-card px-1 flex items-center">
                <span className={`block h-1 ${c === 3 ? "w-1/2 bg-primary/70 rounded-[2px]" : "w-2/3 " + bar}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuCard() {
  return (
    <div className="h-full aspect-[3/4] bg-card rounded-md border border-border p-2.5 flex flex-col shadow-sm">
      <div className="text-center font-extrabold text-foreground" style={{ fontSize: 13 }}>MENU</div>
      <div className="mt-0.5 mx-auto h-px w-8 bg-primary" />
      <div className="mt-2 flex-1 space-y-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className={`h-1.5 flex-1 ${bar}`} />
            <span className="h-1.5 w-4 rounded-[2px] bg-primary/70" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FlyerCard() {
  return (
    <div className="h-full aspect-[3/4] rounded-md border border-border overflow-hidden flex flex-col bg-card shadow-sm">
      <div className="flex-1 bg-primary/85 p-2 flex flex-col justify-end text-primary-foreground">
        <div className="font-extrabold leading-none" style={{ fontSize: 16 }}>SALE</div>
        <div className="mt-0.5 text-[8px] opacity-90 font-semibold">THIS WEEK ONLY</div>
      </div>
      <div className="p-1.5 space-y-1">
        <span className={`block h-1 w-5/6 ${bar}`} />
        <span className={`block h-1 w-3/5 ${bar}`} />
      </div>
    </div>
  );
}

function AutomationFlow() {
  return (
    <div className="w-full h-full bg-card rounded-md border border-border p-3 flex items-center justify-between gap-1.5">
      {["A", "B", "C"].map((n, i) => (
        <div key={n} className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-foreground">{n}</div>
          {i < 2 && <div className="w-4 h-px bg-primary" />}
        </div>
      ))}
    </div>
  );
}

function ChatMock() {
  return (
    <div className="w-full h-full bg-card rounded-md border border-border p-2 flex flex-col gap-1.5">
      <div className="self-start max-w-[70%] px-2 py-1 rounded-md bg-secondary">
        <span className={`block h-1 w-16 ${bar}`} />
        <span className={`block h-1 w-10 mt-1 ${bar}`} />
      </div>
      <div className="self-end max-w-[70%] px-2 py-1 rounded-md bg-primary text-primary-foreground">
        <span className="block h-1 w-14 rounded-[2px] bg-primary-foreground/70" />
        <span className="block h-1 w-10 mt-1 rounded-[2px] bg-primary-foreground/70" />
      </div>
      <div className="self-start max-w-[70%] px-2 py-1 rounded-md bg-secondary">
        <span className={`block h-1 w-20 ${bar}`} />
      </div>
    </div>
  );
}