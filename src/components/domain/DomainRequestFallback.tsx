import { Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createDomainRequest } from "@/lib/domainRequests";
import { SUPPORTED_DOMAIN_TLDS, type SupportedDomainTld } from "@/lib/upmindConfig";

function cleanDomain(value: string, tld: string) {
  const raw = value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] ?? "";
  const selected = tld.replace(/^\./, "");
  if (raw.endsWith(`.${selected}`)) return raw;
  const first = raw.split(".")[0] ?? raw;
  return `${first}.${selected}`;
}

function validateDomain(domain: string): string | null {
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(domain)) return "Enter a valid domain such as yourbrand.ca.";
  if (domain.includes("..")) return "Domain names cannot contain consecutive dots.";
  if (domain.split(".").some((part) => part.length === 0 || part.startsWith("-") || part.endsWith("-"))) {
    return "Domain labels cannot start or end with a hyphen.";
  }
  return null;
}

export function DomainRequestFallback({ diagnosticCode }: { diagnosticCode?: string }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [domain, setDomain] = useState("yourbrand");
  const [tld, setTld] = useState<SupportedDomainTld>("ca");
  const [contactName, setContactName] = useState(user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const fullDomain = useMemo(() => cleanDomain(domain, tld), [domain, tld]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const validation = validateDomain(fullDomain);
    if (validation) { setError(validation); return; }
    if (!isAuthenticated && !contactEmail && !contactPhone) {
      setError("Add an email or phone number so TAKATAK can contact you.");
      return;
    }
    setStatus("submitting");
    await createDomainRequest({
      domain: fullDomain,
      tld,
      contactName: contactName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "TAKATAK customer",
      contactEmail: contactEmail || user?.email,
      contactPhone: contactPhone || user?.phone,
      source: diagnosticCode ? `upmind_fallback:${diagnosticCode}` : "upmind_fallback",
    });
    setStatus("done");
  };

  const continueSignup = () => {
    void navigate({ to: "/signup", search: { next: "/domain", domain: fullDomain, promo: "FIRST10" } as never });
  };

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={22} />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Domain registration request received</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We’ll verify availability for <span className="font-medium text-foreground">{fullDomain}</span> and contact you before registration.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {!isAuthenticated && (
                <button onClick={continueSignup} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  Create account <ArrowRight size={15} />
                </button>
              )}
              <Link to="/hosting" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
                View hosting plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
          <AlertTriangle size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground">Domain search is temporarily unavailable</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We’ll verify availability and contact you before registration.
          </p>
          {import.meta.env.DEV && diagnosticCode && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">Diagnostic: {diagnosticCode}</p>
          )}
        </div>
      </div>
      <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
        <label className="sr-only" htmlFor="fallback-domain">Domain</label>
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-background px-3 py-3 focus-within:border-primary">
          <Search size={17} className="shrink-0 text-muted-foreground" />
          <input id="fallback-domain" value={domain} onChange={(e) => setDomain(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="yourbrand" />
        </div>
        <select value={tld} onChange={(e) => setTld(e.target.value as SupportedDomainTld)} className="rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary">
          {SUPPORTED_DOMAIN_TLDS.map((ext) => <option key={ext} value={ext}>.{ext}</option>)}
        </select>
        <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary sm:col-span-2" placeholder="Name" />
        {!isAuthenticated && (
          <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2">
            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" className="rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary" placeholder="Email" />
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary" placeholder="Phone" />
          </div>
        )}
        {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
        <button disabled={status === "submitting"} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:col-span-2">
          {status === "submitting" ? "Sending request…" : "Request domain registration"} <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}