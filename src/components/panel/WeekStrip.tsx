import Link from "next/link";

import { panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";
import type { AgendaItem } from "@/lib/life/agenda";
import { formatShort, formatWeekdayShort } from "@/lib/life/dates";
import { formatMoney } from "@/lib/life/money";
import type { ISODate, TagColor } from "@/lib/life/model";

import { AgendaIcon } from "./icons";
import { tagClass } from "./ui";

export interface WeekDay {
  date: ISODate;
  items: AgendaItem[];
  /** What is due to be paid that day, when the amount is known. */
  due: number;
  /** How many of that day's payments have no amount yet. */
  dueUnknown: number;
}

/**
 * The week as a stack of thin lines, one per day.
 *
 * Each line is the whole day at a glance: the icons of what is on it, the
 * first few titles, and what there is to pay. It replaces half a screen of
 * big tiles, and the whole week fits above the fold.
 */
export function WeekStrip({
  days,
  today,
  colorOf,
}: {
  days: WeekDay[];
  today: ISODate;
  /** The colour of the project an item belongs to, if any. */
  colorOf: (item: AgendaItem) => TagColor | null;
}) {
  return (
    <ul className="overflow-hidden rounded-2xl bg-surface">
      {days.map((day) => {
        const isToday = day.date === today;
        const weekend = [0, 6].includes(new Date(`${day.date}T00:00:00Z`).getUTCDay());
        const shown = day.items.slice(0, 4);
        const rest = day.items.length - shown.length;

        return (
          <li key={day.date} className="border-b border-line-soft last:border-b-0">
            <Link
              href={`${panelRoutes.calendar}?vista=dia&fecha=${day.date}`}
              className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 transition-colors hover:bg-fill sm:flex-nowrap sm:px-4"
            >
              <span
                className={cn(
                  "flex w-[5.5rem] shrink-0 items-baseline gap-1.5 text-sm",
                  isToday ? "font-semibold text-fg" : weekend ? "text-fg-subtle" : "text-fg-muted",
                )}
              >
                <span className="capitalize">{isToday ? "Hoy" : formatWeekdayShort(day.date)}</span>
                <span className="tnum text-xs">{formatShort(day.date).split(" ").slice(0, 2).join(" ")}</span>
              </span>

              {day.items.length === 0 ? (
                <span className="min-w-0 flex-1 truncate text-sm text-fg-quiet">—</span>
              ) : (
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="flex shrink-0 items-center gap-1" aria-hidden>
                    {shown.map((item) => {
                      const color = colorOf(item);
                      return (
                        <AgendaIcon
                          key={item.key}
                          kind={item.kind}
                          category={item.category}
                          className={cn("size-4", color ? tagClass(color, "text") : "text-fg-subtle")}
                          strokeWidth={2}
                        />
                      );
                    })}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-fg">
                    {shown.map((item) => (item.time ? `${item.time} ${item.title}` : item.title)).join(" · ")}
                    {rest > 0 ? ` · +${rest}` : ""}
                  </span>
                </span>
              )}

              <span className="ml-auto shrink-0 text-right text-sm">
                {day.due > 0 ? (
                  <span className="tnum font-semibold text-fg">{formatMoney(day.due)}</span>
                ) : day.dueUnknown > 0 ? (
                  <span className="text-fg-muted">sin importe</span>
                ) : (
                  <span className="text-fg-quiet">·</span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
