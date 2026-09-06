import { Check, FileImage, MessageSquare, Paperclip, Smartphone } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCAD, pricing } from "@/lib/pricing";
import type { DeliveryStageKey } from "@/lib/deliveryStages";

/** Illustrative label/value row inside the demonstration workspace. */
function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/70 py-2 last:border-0">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-[13px] ${strong ? "font-semibold text-foreground" : "text-foreground/85"}`}>{value}</span>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] ${className}`}>{children}</div>
  );
}

/**
 * Main workspace content for the active delivery stage. Every panel is a
 * demonstration of the TAKATAK process — never live customer data.
 */
export function StagePanel({ stageKey, beat }: { stageKey: DeliveryStageKey; beat: number }) {
  const { tx } = useLanguage();
  const show = (n: number) => (beat >= n ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2");
  const anim = "transition-all duration-500";

  if (stageKey === "request") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className={`${anim} ${show(0)}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {tx({ en: "Intake", fr: "Prise en charge" })}
          </p>
          <div className="mt-2">
            <Row label={tx({ en: "Service", fr: "Service" })} value={tx({ en: "Premium business website", fr: "Site web d'affaires premium" })} strong />
            <Row label={tx({ en: "Business", fr: "Entreprise" })} value="Café Rivière" />
            <Row label={tx({ en: "Goal", fr: "Objectif" })} value={tx({ en: "Launch a professional online presence", fr: "Lancer une présence en ligne professionnelle" })} />
            <Row label={tx({ en: "Timeline", fr: "Échéancier" })} value={tx({ en: "Requested: 3 weeks", fr: "Demandé : 3 semaines" })} />
          </div>
        </Card>
        <div className="flex flex-col gap-3">
          <Card className={`${anim} ${show(1)}`}>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
              <Paperclip size={13} className="text-primary" aria-hidden />
              {tx({ en: "Reference material", fr: "Matériel de référence" })}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <span key={i} className="grid h-12 place-items-center rounded-lg border border-dashed border-border bg-secondary/50 text-muted-foreground">
                  <FileImage size={14} aria-hidden />
                </span>
              ))}
            </div>
          </Card>
          <Card className={`${anim} ${show(2)} border-primary/40 bg-primary/[0.06]`}>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
              <Check size={14} className="text-primary" aria-hidden />
              {tx({ en: "Request confirmed and organized", fr: "Demande confirmée et organisée" })}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (stageKey === "scope") {
    return (
      <Card className={`${anim} ${show(0)}`}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          {tx({ en: "Project scope", fr: "Portée du projet" })}
        </p>
        <div className="mt-2 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <div>
            <Row label={tx({ en: "Service", fr: "Service" })} value={tx({ en: "Websites", fr: "Sites web" })} />
            <Row label={tx({ en: "Package", fr: "Forfait" })} value={pricing.websites[0]?.name ?? "Starter"} strong />
            <Row
              label={tx({ en: "Price", fr: "Prix" })}
              value={`${tx({ en: "from", fr: "à partir de" })} ${formatCAD(pricing.websites[0]?.amount ?? 0)}`}
              strong
            />
          </div>
          <div className={`${anim} ${show(1)}`}>
            <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground sm:mt-2">
              {tx({ en: "Deliverables", fr: "Livrables" })}
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {[
                { en: "Designed pages", fr: "Pages conçues" },
                { en: "Mobile-ready layout", fr: "Mise en page adaptée au mobile" },
                { en: "Contact and enquiry setup", fr: "Formulaire de contact configuré" },
              ].map((d) => (
                <li key={d.en} className="flex items-start gap-2 text-[13px] text-foreground/85">
                  <Check size={13} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                  {tx(d)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={`${anim} ${show(2)} mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/[0.06] px-3 py-2`}>
          <span className="text-[12px] text-muted-foreground">
            {tx({ en: "Next step: confirm scope to start production", fr: "Prochaine étape : confirmer la portée pour lancer la production" })}
          </span>
          <span aria-hidden className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
            {tx({ en: "Confirm scope", fr: "Confirmer la portée" })}
          </span>
        </div>
      </Card>
    );
  }

  if (stageKey === "workspace") {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className={`${anim} ${show(0)}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {tx({ en: "Project timeline", fr: "Échéancier du projet" })}
          </p>
          <ol className="mt-2 space-y-2">
            {[
              { en: "Scope confirmed", fr: "Portée confirmée" },
              { en: "Design in preparation", fr: "Design en préparation" },
              { en: "Content collection", fr: "Collecte de contenu" },
            ].map((s, i) => (
              <li key={s.en} className="flex items-center gap-2 text-[13px] text-foreground/85">
                <span className={`h-2 w-2 rounded-full ${i === 0 ? "bg-primary" : "bg-border"}`} aria-hidden />
                {tx(s)}
              </li>
            ))}
          </ol>
        </Card>
        <div className="flex flex-col gap-3">
          <Card className={`${anim} ${show(1)}`}>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
              <MessageSquare size={13} className="text-primary" aria-hidden />
              {tx({ en: "Messages", fr: "Messages" })}
            </p>
            <p className="mt-1.5 rounded-lg bg-secondary/60 px-2.5 py-2 text-[12px] text-muted-foreground">
              {tx({
                en: "TAKATAK project team: your workspace is ready.",
                fr: "Équipe de projet TAKATAK : votre espace est prêt.",
              })}
            </p>
          </Card>
          <Card className={`${anim} ${show(2)}`}>
            <p className="text-[13px] font-semibold text-foreground">{tx({ en: "Activity", fr: "Activité" })}</p>
            <ul className="mt-1.5 space-y-1 text-[12px] text-muted-foreground">
              <li>{tx({ en: "Files shared · today", fr: "Fichiers partagés · aujourd'hui" })}</li>
              <li>{tx({ en: "Workspace opened · today", fr: "Espace ouvert · aujourd'hui" })}</li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  if (stageKey === "build") {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className={`${anim} ${show(0)}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {tx({ en: "Production preview", fr: "Aperçu de production" })}
          </p>
          <div className="mt-2 space-y-2 rounded-lg border border-border bg-secondary/40 p-3">
            <span className={`block h-16 rounded-md ${anim} ${beat >= 1 ? "bg-primary/20" : "bg-border/60"}`} />
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`block h-8 rounded-md ${anim} ${beat >= 2 ? "bg-primary/15" : "bg-border/50"}`}
                  style={{ transitionDelay: `${i * 90}ms` }}
                />
              ))}
            </div>
          </div>
        </Card>
        <div className="flex flex-col gap-3">
          <Card className={`${anim} ${show(2)}`}>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
              <Smartphone size={13} className="text-primary" aria-hidden />
              {tx({ en: "Mobile view", fr: "Vue mobile" })}
            </p>
            <span className="mt-2 block h-14 w-9 rounded-md border border-border bg-secondary/60" aria-hidden />
          </Card>
          <Card className={`${anim} ${show(3)}`}>
            <p className="text-[13px] font-semibold text-foreground">{tx({ en: "Tasks", fr: "Tâches" })}</p>
            <ul className="mt-1.5 space-y-1.5 text-[12px]">
              {[
                { en: "Wireframe", fr: "Maquette fil de fer" },
                { en: "Design", fr: "Design" },
                { en: "Responsive layout", fr: "Mise en page adaptative" },
              ].map((t, i) => (
                <li key={t.en} className="flex items-center gap-2 text-foreground/85">
                  <span
                    className={`grid h-4 w-4 place-items-center rounded border ${beat >= i + 1 ? "border-primary bg-primary/15 text-primary" : "border-border text-transparent"}`}
                    aria-hidden
                  >
                    <Check size={10} />
                  </span>
                  {tx(t)}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  if (stageKey === "review") {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className={`relative ${anim} ${show(0)}`}>
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <span className="block h-16 rounded-md bg-primary/15" aria-hidden />
            <span className="mt-2 block h-6 w-2/3 rounded-md bg-border/60" aria-hidden />
          </div>
          <span
            aria-hidden
            className={`absolute right-8 top-10 grid h-6 w-6 place-items-center rounded-full border border-primary bg-primary/15 text-[10px] font-bold text-primary ${anim} ${show(1)}`}
          >
            1
          </span>
        </Card>
        <Card className={`${anim} ${show(2)}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {tx({ en: "Feedback", fr: "Commentaires" })}
          </p>
          <ul className="mt-2 space-y-2 text-[12px] text-foreground/85">
            <li className="rounded-lg bg-secondary/60 px-2.5 py-2">{tx({ en: "Update CTA wording", fr: "Ajuster le texte du bouton d'action" })}</li>
            <li className="rounded-lg bg-secondary/60 px-2.5 py-2">{tx({ en: "Replace hero image", fr: "Remplacer l'image principale" })}</li>
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {tx({ en: "Revision noted by the TAKATAK reviewer", fr: "Révision notée par le réviseur TAKATAK" })}
          </p>
        </Card>
      </div>
    );
  }

  if (stageKey === "approval") {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className={`${anim} ${show(0)}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {tx({ en: "Final preview", fr: "Aperçu final" })}
          </p>
          <div className="mt-2 rounded-lg border border-border bg-secondary/40 p-3">
            <span className="block h-20 rounded-md bg-primary/15" aria-hidden />
          </div>
        </Card>
        <Card className={`${anim} ${show(1)} border-primary/40 bg-primary/[0.05]`}>
          <p className="text-[13px] font-semibold text-foreground">{tx({ en: "Delivery summary", fr: "Résumé de livraison" })}</p>
          <div className="mt-1.5">
            <Row label={tx({ en: "Deliverables", fr: "Livrables" })} value={tx({ en: "Ready", fr: "Prêts" })} />
            <Row label={tx({ en: "Review", fr: "Révision" })} value={tx({ en: "Completed", fr: "Terminée" })} />
          </div>
          <span
            aria-hidden
            className={`mt-3 inline-block rounded-md px-3 py-1.5 text-[12px] font-semibold ${beat >= 2 ? "bg-primary text-primary-foreground" : "border border-primary/40 text-primary"}`}
          >
            {tx({ en: "Approve delivery", fr: "Approuver la livraison" })}
          </span>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {tx({ en: "Illustration of the approval step — you decide.", fr: "Illustration de l'étape d'approbation — vous décidez." })}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr]">
      <Card className={`${anim} ${show(0)}`}>
        <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <MessageSquare size={13} className="text-primary" aria-hidden />
          {tx({ en: "Support thread", fr: "Fil de soutien" })}
        </p>
        <p className="mt-1.5 rounded-lg bg-secondary/60 px-2.5 py-2 text-[12px] text-muted-foreground">
          {tx({
            en: "TAKATAK support: your project is delivered. We stay available in English and French.",
            fr: "Soutien TAKATAK : votre projet est livré. Nous restons disponibles en français et en anglais.",
          })}
        </p>
      </Card>
      <div className="flex flex-col gap-3">
        <Card className={`${anim} ${show(1)}`}>
          <p className="text-[13px] font-semibold text-foreground">{tx({ en: "Service management", fr: "Gestion des services" })}</p>
          <div className="mt-1.5">
            <Row label={tx({ en: "Website", fr: "Site web" })} value={tx({ en: "Live", fr: "En ligne" })} strong />
            <Row label={tx({ en: "Hosting", fr: "Hébergement" })} value={tx({ en: "Managed", fr: "Géré" })} />
          </div>
        </Card>
        <Card className={`${anim} ${show(2)}`}>
          <p className="text-[13px] font-semibold text-foreground">{tx({ en: "What's next", fr: "Prochaine étape" })}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {tx({ en: "Add local visibility or lead generation when you're ready.", fr: "Ajoutez la visibilité locale ou la génération de clients quand vous serez prêt." })}
          </p>
        </Card>
      </div>
    </div>
  );
}
