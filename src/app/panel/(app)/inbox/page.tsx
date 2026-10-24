import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DismissInboxButton, InboxCapture, LeadProcessedButton } from "@/components/panel/Actions";
import { PageHeader } from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";
import type { EntityKind } from "@/lib/life/entities";
import { relativeDay } from "@/lib/life/dates";
import { INBOX_PARAM, newHref } from "@/lib/life/links";
import type { InboxItem, Lead } from "@/lib/life/model";
import { loadInbox, loadLeads, requirePanelSession } from "@/lib/life/server";
import { goalLabel, sectorLabel } from "@/lib/diagnosis-schema";

export const metadata: Metadata = { title: "Inbox" };

/** Each inbox line can become one of these. The text travels as the title. */
const conversions: { label: string; kind: EntityKind; field: string; dateField?: string; extra?: Record<string, string> }[] = [
  { label: "Tarea", kind: "task", field: "title", dateField: "due_date" },
  { label: "Evento", kind: "event", field: "title", dateField: "date" },
  { label: "Pago", kind: "transaction", field: "description", dateField: "date", extra: { kind: "expense", planned: "true" } },
  { label: "Proyecto", kind: "project", field: "name" },
  { label: "Nota", kind: "vault", field: "title", extra: { category: "notes" } },
];

/** Capturar ahora, decidir después. */
export default async function InboxPage() {
  const { today } = await requirePanelSession();
  const [items, leads] = await Promise.all([loadInbox(), loadLeads()]);
  const pendingLeads = leads.filter((lead) => lead.processed_at === null);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader title="Inbox" question="Escribe lo que tengas en la cabeza. Luego lo conviertes en algo." />

      {leads.length ? (
        <section aria-labelledby="leads-title" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
            <h2 id="leads-title" className="text-lg font-semibold tracking-[-0.015em]">
              Solicitudes de diagnóstico
              <span className="ml-2 text-sm font-normal text-fg-subtle">
                {pendingLeads.length ? `${pendingLeads.length} sin atender` : "todas atendidas"}
              </span>
            </h2>
            <p className="text-sm text-fg-muted">Llegan del formulario de la web</p>
          </div>
          <ul className="flex flex-col gap-2">
            {leads.slice(0, 20).map((lead) => (
              <LeadRow key={lead.id} lead={lead} today={today} />
            ))}
          </ul>
        </section>
      ) : null}

      <InboxCapture autoFocus />

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-fill text-fg-muted">
            <Inbox className="size-6" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="text-base font-semibold text-fg">Inbox vacío</p>
          <p className="max-w-[40ch] text-sm text-fg-muted">Todo lo que apuntes aquí espera hasta que decidas qué es.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <InboxRow key={item.id} item={item} today={today} />
          ))}
        </ul>
      )}
    </div>
  );
}

function InboxRow({ item, today }: { item: InboxItem; today: string }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-[0.9375rem] text-fg">{item.text}</p>
        <DismissInboxButton id={item.id} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-fg-subtle">
          {relativeDay(item.created_at.slice(0, 10), today)}
          {item.category ? ` · ${item.category}` : ""}
          {" · Convertir en"}
        </span>
        {conversions.map((c) => (
          <Link
            key={c.label}
            href={newHref(c.kind, panelRoutes.inbox, {
              [c.field]: item.text.slice(0, c.kind === "project" ? 120 : 200),
              ...(c.dateField && item.date ? { [c.dateField]: item.date } : {}),
              ...c.extra,
              [INBOX_PARAM]: item.id,
            })}
            scroll={false}
            className="inline-flex min-h-9 items-center rounded-full bg-fill px-3 text-sm font-medium text-fg transition-colors hover:bg-fill-strong"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </li>
  );
}

function LeadRow({ lead, today }: { lead: Lead; today: string }) {
  const date = lead.created_at.slice(0, 10);
  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-2xl p-4",
        lead.processed_at ? "bg-fill" : "bg-surface",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-[0.9375rem] font-semibold text-fg">
          {lead.company}
          <span className="ml-2 font-normal text-fg-muted">{lead.name}</span>
        </p>
        <p className="text-sm text-fg-subtle">{relativeDay(date, today)}</p>
      </div>

      <p className="text-sm text-fg-muted">
        {[sectorLabel(lead.sector), goalLabel(lead.goal)].join(" · ")}
      </p>

      {lead.context ? <p className="text-sm whitespace-pre-line text-fg">{lead.context}</p> : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <a href={`mailto:${lead.email}`} className="font-medium text-accent-text hover:underline">
          {lead.email}
        </a>
        {lead.phone ? (
          <a href={`tel:${lead.phone}`} className="text-fg-muted hover:underline">
            {lead.phone}
          </a>
        ) : null}
        <span className="ml-auto">
          <LeadProcessedButton id={lead.id} processed={lead.processed_at !== null} />
        </span>
      </div>
    </li>
  );
}

