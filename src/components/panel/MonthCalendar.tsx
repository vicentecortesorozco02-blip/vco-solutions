import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";
import type { AgendaItem } from "@/lib/life/agenda";
import { addMonths, eachDay, endOfMonth, formatMonth, startOfMonth, startOfWeek, addDays } from "@/lib/life/dates";
import { formatMoney } from "@/lib/life/money";
import type { ISODate } from "@/lib/life/model";

const PAYMENT_KINDS = new Set(["charge", "planned", "domain"]);
const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

type Mode = "money" | "work";
type DayState = "empty" | "busy" | "due" | "paid";

/** Paid wins only when every payment of the day is behind us or marked done. */
function stateOf(items: AgendaItem[], date: ISODate, today: ISODate, mode: Mode): DayState {
  if (!items.length) return "empty";
  if (mode === "work") {
    if (items.every((i) => i.done)) return "paid";
    return date < today ? "due" : "busy";
  }
  const payments = items.filter((i) => PAYMENT_KINDS.has(i.kind));
  if (!payments.length) return "busy";
  return payments.every((p) => p.done || date < today) ? "paid" : "due";
}

const stateClass: Record<DayState, string> = {
  empty: "bg-fill/40 text-fg-muted",
  busy: "bg-accent-quiet text-accent-text",
  due: "bg-caution-quiet text-caution",
  paid: "bg-accent text-accent-fg",
};

const stateLabels: Record<Mode, Record<DayState, string>> = {
  money: { empty: "Nada", busy: "Agenda", due: "Por pagar", paid: "Pagado" },
  work: { empty: "Nada", busy: "Pendiente", due: "Atrasado", paid: "Hecho" },
};

/**
 * The whole month at a glance. Each day is tinted by what it holds and
 * shows its count, so the colour is never the only signal. Hover or focus
 * a day to see the list; click to open it in the calendar.
 */
export function MonthCalendar({
  month,
  today,
  itemsFor,
  basePath = panelRoutes.home,
  mode = "money",
}: {
  /** Where the month arrows point; the month goes in `?mes=`. */
  basePath?: string;
  /** "money" tints by payments; "work" tints by what is done or late. */
  mode?: Mode;
  /** Any date inside the month to draw. */
  month: ISODate;
  today: ISODate;
  itemsFor: (date: ISODate) => AgendaItem[];
}) {
  const stateLabel = stateLabels[mode];
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const gridStart = startOfWeek(first);
  const gridEnd = addDays(startOfWeek(last), 6);
  const monthKey = first.slice(0, 7);
  const prev = addMonths(first, -1).slice(0, 7);
  const next = addMonths(first, 1).slice(0, 7);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <div className="flex items-center justify-between">
        <Link
          href={`${basePath}?mes=${prev}`}
          aria-label="Mes anterior"
          className="grid size-8 place-items-center rounded-full text-fg-muted hover:bg-fill"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
        <h2 className="text-base font-semibold capitalize text-fg">{formatMonth(first)}</h2>
        <Link
          href={`${basePath}?mes=${next}`}
          aria-label="Mes siguiente"
          className="grid size-8 place-items-center rounded-full text-fg-muted hover:bg-fill"
        >
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-fg-subtle" aria-hidden>
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <ol className="grid grid-cols-7 gap-1">
        {eachDay(gridStart, gridEnd).map((date, index) => {
          const inMonth = date.slice(0, 7) === monthKey;
          if (!inMonth) return <li key={date} aria-hidden />;
          const items = itemsFor(date);
          const state = stateOf(items, date, today, mode);
          const due = items
            .filter((i) => PAYMENT_KINDS.has(i.kind))
            .reduce((sum, i) => sum + (i.amount ?? 0), 0);
          const column = index % 7;
          return (
            <li key={date} className="group relative">
              <Link
                href={`${panelRoutes.calendar}?vista=dia&fecha=${date}`}
                className={cn(
                  "flex h-11 flex-col items-center justify-center rounded-lg text-sm leading-tight transition-transform hover:scale-105",
                  stateClass[state],
                  date === today && "ring-2 ring-fg",
                )}
                aria-label={`${Number(date.slice(8))}: ${items.length ? items.map((i) => i.title).join(", ") : "nada"}`}
              >
                <span className="tnum font-semibold">{Number(date.slice(8))}</span>
                {items.length ? <span className="tnum text-[0.6875rem] opacity-80">{items.length}</span> : null}
              </Link>
              {items.length ? (
                <div
                  role="tooltip"
                  className={cn(
                    "pointer-events-none invisible absolute top-full z-20 mt-1 w-56 rounded-xl bg-surface-raised p-3 text-left opacity-0 shadow-[var(--shadow-pop)] transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100",
                    column > 3 ? "right-0" : "left-0",
                  )}
                >
                  <p className="mb-1 text-xs font-semibold text-fg-subtle">
                    {stateLabel[state]}
                    {due > 0 ? ` · ${formatMoney(due)}` : ""}
                  </p>
                  <ul className="flex flex-col gap-0.5 text-sm text-fg">
                    {items.slice(0, 6).map((item) => (
                      <li key={item.key} className="truncate">
                        {item.time ? `${item.time} ` : ""}
                        {item.title}
                        {item.amount !== undefined ? ` · ${formatMoney(item.amount, { currency: item.currency })}` : ""}
                      </li>
                    ))}
                    {items.length > 6 ? <li className="text-fg-muted">+{items.length - 6} más</li> : null}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-fg-muted">
        {(["busy", "due", "paid"] as const).map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className={cn("size-3 rounded", stateClass[s])} aria-hidden />
            {stateLabel[s]}
          </li>
        ))}
      </ul>
    </div>
  );
}
