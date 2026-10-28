import { CalendarRange } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AgendaIcon } from "@/components/panel/icons";
import { EmptyState, PageHeader } from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { type AgendaItem, buildAgenda } from "@/lib/life/agenda";
import { addDays, endOfMonth, formatShort, formatWeekdayShort, relativeDay, startOfWeek } from "@/lib/life/dates";
import { agendaHref } from "@/lib/life/links";
import { formatMoney } from "@/lib/life/money";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Fechas importantes" };

/**
 * Everything with a date, from every module, in one timeline. Tasks are
 * left out: they have their own screen and would bury the milestones.
 */
export default async function DatesPage() {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();
  const horizon = addDays(today, 90);
  const items = buildAgenda(data, today, horizon).filter((i) => i.kind !== "task" && !i.done);

  const weekEnd = addDays(startOfWeek(today), 6);
  const monthEnd = endOfMonth(today);
  const buckets = [
    { key: "today", label: "Hoy", items: items.filter((i) => i.date === today) },
    { key: "week", label: "Esta semana", items: items.filter((i) => i.date > today && i.date <= weekEnd) },
    { key: "month", label: "Este mes", items: items.filter((i) => i.date > weekEnd && i.date <= monthEnd) },
    { key: "later", label: "Próximos 90 días", items: items.filter((i) => i.date > monthEnd) },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Fechas importantes" question="Cumpleaños, renovaciones, vencimientos, exámenes, viajes y pagos." />
      {items.length === 0 ? (
        <EmptyState icon={CalendarRange} title="Nada en los próximos 90 días">
          Las fechas aparecen solas al guardar cumpleaños, dominios, suscripciones, documentos o entregas.
        </EmptyState>
      ) : (
        buckets.map((bucket) => (
          <section key={bucket.key} aria-labelledby={`b-${bucket.key}`} className="flex flex-col gap-3">
            <h2 id={`b-${bucket.key}`} className="px-1 text-lg font-semibold tracking-[-0.015em]">
              {bucket.label}
            </h2>
            {bucket.items.length ? (
              <ol className="flex flex-col gap-2">
                {bucket.items.map((item) => (
                  <Milestone key={item.key} item={item} today={today} />
                ))}
              </ol>
            ) : (
              <p className="px-1 text-sm text-fg-subtle">Nada.</p>
            )}
          </section>
        ))
      )}
    </div>
  );
}

function Milestone({ item, today }: { item: AgendaItem; today: string }) {
  return (
    <li>
      <Link
        href={agendaHref(item, panelRoutes.dates)}
        scroll={false}
        className="flex items-center gap-4 rounded-2xl bg-surface px-4 py-3 transition-colors hover:bg-surface-raised"
      >
        <span className="flex w-12 shrink-0 flex-col items-center leading-none">
          <span className="text-[0.6875rem] font-semibold text-fg-subtle uppercase">{formatWeekdayShort(item.date)}</span>
          <span className="tnum text-xl font-semibold tracking-[-0.02em] text-fg">{Number(item.date.slice(8))}</span>
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fill text-fg-muted">
          <AgendaIcon kind={item.kind} category={item.category} className="size-[1.125rem]" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[0.9375rem] font-medium text-fg">{item.title}</span>
          <span className="truncate text-sm text-fg-muted">
            {[item.detail, item.date === today ? null : `${formatShort(item.date)}, ${relativeDay(item.date, today)}`]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        {item.amount !== undefined ? <span className="tnum text-sm font-semibold text-fg">{formatMoney(item.amount, { currency: item.currency })}</span> : null}
      </Link>
    </li>
  );
}
