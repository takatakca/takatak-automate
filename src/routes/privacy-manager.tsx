import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/privacy-manager")({
  head: () => ({
    meta: [
      { title: "Privacy Manager — TAKATAK" },
      {
        name: "description",
        content:
          "Review the data TAKATAK collects across domains, hosting, marketplace, QMAPS, FLEXS, AI tools and notifications, and exercise your privacy rights.",
      },
      { property: "og:title", content: "Privacy Manager — TAKATAK" },
      {
        property: "og:description",
        content:
          "Manage your TAKATAK privacy preferences and data rights in one place.",
      },
    ],
  }),
  component: PrivacyManagerPage,
});

const SERVICES = [
  { name: "Domains", desc: "Registrant contact data and DNS configuration handled with our registrar partner (Upmind)." },
  { name: "Hosting", desc: "Account and billing data needed to provision and renew managed hosting plans." },
  { name: "Service marketplace", desc: "Project briefs, files, messages and order history for marketplace packages." },
  { name: "QMAPS — Local listings", desc: "Business profile data published to Google Business, maps and directories on your behalf." },
  { name: "FLEXS — Lead generation", desc: "Lead capture forms, outreach lists and campaign analytics." },
  { name: "AI tools", desc: "Prompts and uploads processed to deliver AI-assisted business automation." },
  { name: "Payments & orders", desc: "Order, invoice and payment status records held for accounting and compliance." },
  { name: "Notifications", desc: "Transactional emails and in-app notifications about your services and projects." },
];

const RIGHTS = [
  "Access a copy of the personal data we hold about you.",
  "Correct inaccurate or incomplete personal data.",
  "Delete your TAKATAK account and associated personal data, subject to legal retention.",
  "Restrict or object to certain processing activities.",
  "Withdraw consent for marketing communications at any time.",
  "Export your data in a portable, machine-readable format.",
];

function PrivacyManagerPage() {
  return (
    <SiteShell>
      <section className="max-w-4xl mx-auto px-4 py-16">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold">Privacy Manager</h1>
          <p className="mt-3 text-muted-foreground">
            TAKATAK is committed to transparency about the data we collect across every service we operate. Use this page to understand what is collected and how to exercise your privacy rights.
          </p>
        </header>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Services and data collected</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SERVICES.map((s) => (
              <div key={s.name} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">{s.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Your rights</h2>
          <ul className="mt-4 list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {RIGHTS.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </section>

        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Exercise a privacy right</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Email <a href="mailto:support@takatak.ca" className="text-primary hover:underline">support@takatak.ca</a> from the address associated with your TAKATAK account and describe the request. We respond within 30 days.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/dashboard/account" className="px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90">
              Manage account
            </Link>
            <Link to="/dashboard/notifications" className="px-4 py-2 rounded-md text-sm font-semibold border border-border hover:bg-secondary">
              Notification preferences
            </Link>
          </div>
        </section>
      </section>
    </SiteShell>
  );
}