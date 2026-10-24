import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AgendaIcon } from "@/components/panel/icons";
import { HeaderLink, PageHeader, ViewTabs, tagClass } from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";
import { type AgendaItem, buildAgenda, itemsOn } from "@/lib/life/agenda";
import {
  addDays,
  addMonths,
  eachDay,
  endOfMonth,
  formatLong,
  formatMonth,
  formatShort,
  formatWeekdayShort,
  startOfMonth,
  startOfWeek,
} from "@/lib/life/dates";
import { agendaTooltip, colorForAgenda } from "@/lib/life/colors";
import { agendaHref, newHref } from "@/lib/life/links";
import { formatMoney } from "@/lib/life/money";
import type { Project, TagColor } from "@/lib/life/model";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Calendario" };

const views = ["dia", "semana", "mes"] as const;
type View = (typeof views)[number];
const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

/** ¿Qué tengo próximamente? */
export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; fecha?: string }>;
}) {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();
  const params = await searchParams;
  // Un color por proyecto; si no hay proyecto, manda el tipo de cosa.
  const projectOf = new Map<string, Project>();
  const remember = (id: string, projectId: string | null) => {
    const project = projectId ? data.projects.find((p) => p.id === projectId) : null;
    if (project) projectOf.set(id, project);
  };
  for (const task of data.tasks) remember(task.id, task.project_id);
  for (const sub of data.subscriptions) remember(sub.id, sub.project_id);
  for (const domain of data.domains) remember(domain.id, domain.project_id);
  for (const tx of data.transactions) remember(tx.id, tx.project_id);
  const look = (item: AgendaItem) => {
    const project = projectOf.get(item.sourceId) ?? null;
    return { color: colorForAgenda(item, project?.color), tip: agendaTooltip(item, project) };
  };
  const view: View = (views as readonly string[]).includes(params.vista ?? "") ? (params.vista as View) : "mes";
  const focus = /^\d{4}-\d{2}-\d{2}$/.test(params.fecha ?? "") ? params.fecha! : today;

  const range =
    view === "dia"
      ? { from: focus, to: focus }
      : view === "semana"
        ? { from: startOfWeek(focus), to: addDays(startOfWeek(focus), 6) }
        : { from: startOfWeek(startOfMonth(focus)), to: addDays(startOfWeek(endOfMonth(focus)), 6) };

  const items = buildAgenda(data, range.from, range.to);
  const url = (v: View, date: string) => `${panelRoutes.calendar}?vista=${v}&fecha=${date}`;
  const here = url(view, focus);
  const step = (dir: 1 | -1) =>
    view === "dia" ? addDays(focus, dir) : view === "semana" ? addDays(focus, 7 * dir) : addMonths(startOfMonth(focus), dir);

  const title =
    view === "dia"
      ? formatLong(focus)
      : view === "semana"
        ? `${formatShort(range.from)} – ${formatShort(range.to)}`
        : formatMonth(focus);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendario"
        question="¿Qué tengo próximamente?"
        actions={
          <HeaderLink primary icon={Plus} href={newHref("event", here, { date: view === "dia" ? focus : today })}>
            Nuevo evento
          </HeaderLink>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <NavButton href={url(view, step(-1))} label="Anterior">
            <ChevronLeft className="size-5" strokeWidth={2} aria-hidden />
          </NavButton>
          <NavButton href={url(view, step(1))} label="Siguiente">
            <ChevronRight className="size-5" strokeWidth={2} aria-hidden />
          </NavButton>
          <h2 className="ml-2 text-lg font-semibold tracking-[-0.015em] text-fg first-letter:uppercase">{title}</h2>
          {focus !== today ? (
            <Link
              href={url(view, today)}
              scroll={false}
              className="ml-2 inline-flex min-h-9 items-center rounded-full bg-fill px-3 text-sm font-medium text-fg hover:bg-fill-strong"
            >
              Hoy
            </Link>
          ) : null}
        </div>
        <ViewTabs
          label="Vista del calendario"
          current={view}
          tabs={[
            { key: "dia", label: "Día", href: url("dia", focus) },
            { key: "semana", label: "Semana", href: url("semana", focus) },
            { key: "mes", label: "Mes", href: url("mes", focus) },
          ]}
        />
      </div>

      {view === "mes" ? (
        <MonthGrid items={items} from={range.from} to={range.to} focus={focus} today={today} url={url} here={here} look={look} />
      ) : view === "semana" ? (
        <WeekList items={items} days={eachDay(range.from, range.to)} today={today} url={url} here={here} look={look} />
      ) : (
        <DayList items={itemsOn(items, focus)} date={focus} here={here} look={look} />
      )}
    </div>
  );
}

function NavButton({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={label}
      className="grid size-10 place-items-center rounded-full bg-surface text-fg transition-colors hover:bg-surface-raised"
    >
      {children}
    </Link>
  );
}

function MonthGrid({
  items,
  from,
  to,
  focus,
  today,
  url,
  here,
  look,
}: {
  items: AgendaItem[];
  from: string;
  to: string;
  focus: string;
  today: string;
  look: Look;
  url: (v: View, date: string) => string;
  here: string;
}) {
  const month = focus.slice(0, 7);
  const days = eachDay(from, to);
  return (
    <div className="overflow-hidden rounded-2xl bg-surface">
      <div className="grid grid-cols-7 border-b border-line-soft" aria-hidden>
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-fg-subtle">
            {d}
          </div>
        ))}
      </div>
      <ol className="grid grid-cols-7">
        {days.map((day) => {
          const dayItems = itemsOn(items, day);
          const inMonth = day.slice(0, 7) === month;
          const isToday = day === today;
          return (
            <li
              key={day}
              className={cn(
                "relative flex min-h-16 flex-col gap-1 border-b border-r border-line-soft p-1 sm:min-h-28 sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                !inMonth && "bg-bg-subtle/40",
              )}
            >
              <Link
                href={url("dia", day)}
                scroll={false}
                aria-label={`${formatLong(day)}: ${dayItems.length ? `${dayItems.length} cosas` : "nada"}`}
                className="absolute inset-0"
              />
              <span
                className={cn(
                  "tnum relative grid size-7 place-items-center self-center rounded-full text-sm sm:self-start",
                  isToday ? "bg-accent font-semibold text-accent-fg" : inMonth ? "text-fg" : "text-fg-quiet",
                )}
              >
                {Number(day.slice(8))}
              </span>
              {/* Phones: dots. From 640 px: the first titles. */}
              <span className="relative flex flex-wrap justify-center gap-0.5 sm:hidden" aria-hidden>
                {dayItems.slice(0, 3).map((item) => (
                  <span key={item.key} className={cn("size-1.5 rounded-full", tagClass(look(item).color, "fill"))} />
                ))}
              </span>
              <ul className="relative hidden flex-col gap-0.5 sm:flex">
                {dayItems.slice(0, 3).map((item) => {
                  const { color, tip } = look(item);
                  return (
                    <li key={item.key}>
                      <Link
                        href={agendaHref(item, here)}
                        scroll={false}
                        title={tip}
                        className={cn(
                          "block truncate rounded-md px-1.5 py-0.5 text-xs font-medium",
                          tagClass(color),
                          item.done && "line-through opacity-70",
                        )}
                      >
                        {item.time ? <span className="tnum mr-1 opacity-80">{item.time}</span> : null}
                        {item.title}
                        {item.amount !== undefined ? (
                          <span className="tnum ml-1 opacity-80">{formatMoney(item.amount, { round: true })}</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
                {dayItems.length > 3 ? (
                  <li className="px-1.5 text-xs text-fg-subtle">+{dayItems.length - 3} más</li>
                ) : null}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function WeekList({
  items,
  days,
  today,
  url,
  here,
  look,
}: {
  items: AgendaItem[];
  days: string[];
  today: string;
  url: (v: View, date: string) => string;
  here: string;
  look: Look;
}) {
  return (
    <ol className="grid gap-3 lg:grid-cols-7 lg:gap-2">
      {days.map((day) => {
        const dayItems = itemsOn(items, day);
        return (
          <li key={day} className="flex flex-col gap-2 rounded-2xl bg-surface p-3 lg:min-h-64">
            <Link href={url("dia", day)} scroll={false} className="flex items-baseline gap-2 lg:flex-col lg:gap-0">
              <span className="text-xs font-semibold text-fg-subtle uppercase">{formatWeekdayShort(day)}</span>
              <span
                className={cn(
                  "tnum text-xl font-semibold tracking-[-0.02em]",
                  day === today ? "text-accent-text" : "text-fg",
                )}
              >
                {Number(day.slice(8))}
              </span>
            </Link>
            {dayItems.length ? (
              <ul className="flex flex-col gap-1">
                {dayItems.map((item) => (
                  <AgendaChip key={item.key} item={item} here={here} look={look} />
                ))}
              </ul>
            ) : (
              <p className="text-xs text-fg-quiet">—</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function AgendaChip({ item, here, look }: { item: AgendaItem; here: string; look: Look }) {
  const { color, tip } = look(item);
  return (
    <li>
      <Link
        href={agendaHref(item, here)}
        scroll={false}
        title={tip}
        className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-fill"
      >
        <AgendaIcon
          kind={item.kind}
          category={item.category}
          className={cn("mt-0.5 size-3.5 shrink-0", tagClass(color, "text"))}
          strokeWidth={2}
        />
        <span className={cn("min-w-0 flex-1", item.done && "text-fg-subtle line-through")}>
          {item.time ? <span className="tnum mr-1 text-fg-subtle">{item.time}</span> : null}
          <span className="font-medium text-fg">{item.title}</span>
          {item.amount !== undefined ? (
            <span className="tnum ml-1 text-fg-muted">{formatMoney(item.amount, { round: true })}</span>
          ) : null}
        </span>
      </Link>
    </li>
  );
}

/** Colour and tooltip for one item, decided once by the page. */
type Look = (item: AgendaItem) => { color: TagColor; tip: string };

function DayList({ items, date, here, look }: { items: AgendaItem[]; date: string; here: string; look: Look }) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface px-6 py-12 text-center">
        <p className="text-base font-semibold text-fg">Nada este día</p>
        <HeaderLink href={newHref("event", here, { date })} icon={Plus}>
          Añadir evento
        </HeaderLink>
      </div>
    );
  }
  return (
    <ol className="flex flex-col gap-2">
      {items.map((item) => {
        const { color, tip } = look(item);
        return (
          <li key={item.key}>
            <Link
              href={agendaHref(item, here)}
              scroll={false}
              title={tip}
              className="flex items-center gap-4 rounded-2xl bg-surface px-4 py-3.5 transition-colors hover:bg-surface-raised"
            >
              <span className="tnum w-14 shrink-0 text-sm font-semibold text-fg">
                {item.time ?? <span className="font-normal text-fg-subtle">Todo el día</span>}
              </span>
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", tagClass(color))}>
                <AgendaIcon kind={item.kind} category={item.category} className="size-[1.125rem]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={cn("truncate text-[0.9375rem] font-medium text-fg", item.done && "text-fg-subtle line-through")}>
                  {item.title}
                </span>
                {item.detail || item.endTime ? (
                  <span className="truncate text-sm text-fg-muted">
                    {[item.endTime ? `hasta las ${item.endTime}` : null, item.detail].filter(Boolean).join(" · ")}
                  </span>
                ) : null}
              </span>
              {item.amount !== undefined ? (
                <span className="tnum text-sm font-medium text-fg">{formatMoney(item.amount)}</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
