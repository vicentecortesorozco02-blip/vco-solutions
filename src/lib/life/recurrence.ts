import { addDays, addMonths, diffDays, toDate } from "./dates";
import type { CalendarEvent, Frequency, ISODate, Recurrence, Subscription } from "./model";

/**
 * Repeating things: events that recur and subscriptions that charge.
 *
 * Occurrence n is always computed from the original date, never by stepping
 * from the previous one. Stepping drifts: 31 Jan -> 28 Feb -> 28 Mar. From
 * the base it stays on the 31st whenever the month has one.
 */

/** Hard stop for any loop over occurrences. Ten years of daily events. */
const MAX_STEPS = 3_700;

interface Rule {
  unit: "day" | "month";
  every: number;
}

function nth(base: ISODate, n: number, rule: Rule): ISODate {
  if (rule.unit === "day") return addDays(base, n * rule.every);
  return addMonths(base, n * rule.every, toDate(base).getUTCDate());
}

function eventRule(recurrence: Recurrence, interval: number): Rule | null {
  const every = Math.max(1, interval);
  switch (recurrence) {
    case "daily":
      return { unit: "day", every };
    case "weekly":
      return { unit: "day", every: 7 * every };
    case "monthly":
      return { unit: "month", every };
    case "yearly":
      return { unit: "month", every: 12 * every };
    default:
      return null;
  }
}

/**
 * How often a subscription charges, or null when nothing can be forecast:
 * a usage-based cost and an unconfirmed period have no series.
 */
export function frequencyRule(frequency: Frequency, customDays?: number | null): Rule | null {
  switch (frequency) {
    case "weekly":
      return { unit: "day", every: 7 };
    case "every_4_weeks":
      // 28 days exactly, which is not the same as monthly.
      return { unit: "day", every: 28 };
    case "monthly":
      return { unit: "month", every: 1 };
    case "quarterly":
      return { unit: "month", every: 3 };
    case "semiannual":
      return { unit: "month", every: 6 };
    case "annual":
      return { unit: "month", every: 12 };
    case "custom":
      return { unit: "day", every: Math.max(1, customDays ?? 30) };
    case "variable":
    case "unknown":
      return null;
  }
}

/** Anything that can be placed on a calendar: a date and a period. */
export type Forecastable = Pick<Subscription, "next_charge_date" | "frequency" | "custom_days">;

export function canForecast(sub: Forecastable): boolean {
  return sub.next_charge_date !== null && frequencyRule(sub.frequency, sub.custom_days) !== null;
}

/** Index of the first occurrence that could fall on or after `from`. */
function firstIndexNear(base: ISODate, from: ISODate, rule: Rule): number {
  if (from <= base) return 0;
  const days = diffDays(base, from);
  const approx = rule.unit === "day" ? days / rule.every : days / (30.44 * rule.every);
  return Math.max(0, Math.floor(approx) - 1);
}

/**
 * Start dates of every occurrence of `event` that overlaps [from, to].
 * Multi-day events (trips) overlap when any of their days is in range.
 */
export function eventOccurrences(
  event: Pick<CalendarEvent, "date" | "end_date" | "recurrence" | "recurrence_interval" | "recurrence_until">,
  from: ISODate,
  to: ISODate,
): ISODate[] {
  const span = event.end_date ? Math.max(0, diffDays(event.date, event.end_date)) : 0;
  const overlaps = (start: ISODate) => start <= to && addDays(start, span) >= from;

  const rule = eventRule(event.recurrence, event.recurrence_interval);
  if (!rule) return overlaps(event.date) ? [event.date] : [];

  const until = event.recurrence_until && event.recurrence_until < to ? event.recurrence_until : to;
  const out: ISODate[] = [];
  for (let i = firstIndexNear(event.date, addDays(from, -span), rule), steps = 0; steps < MAX_STEPS; i++, steps++) {
    const start = nth(event.date, i, rule);
    if (start > until) break;
    if (overlaps(start)) out.push(start);
  }
  return out;
}

/**
 * Every charge date of a subscription in [from, to].
 *
 * `next_charge_date` is the anchor the user typed. Earlier charges are not
 * invented: the series starts there.
 */
export function chargesBetween(sub: Forecastable, from: ISODate, to: ISODate): ISODate[] {
  const rule = frequencyRule(sub.frequency, sub.custom_days);
  const base = sub.next_charge_date;
  if (!rule || !base) return [];
  const out: ISODate[] = [];
  for (let i = firstIndexNear(base, from, rule), steps = 0; steps < MAX_STEPS; i++, steps++) {
    const date = nth(base, i, rule);
    if (date > to) break;
    if (date >= from) out.push(date);
  }
  return out;
}

/**
 * The next charge on or after `today`, or null when there is none to compute.
 *
 * A stored date in the past rolls forward so nothing shows as "due" forever,
 * but rolling forward is only a forecast: whether those past dates were
 * actually paid is decided by the charges, in `finance.ts`.
 */
export function nextCharge(sub: Forecastable, today: ISODate): ISODate | null {
  const base = sub.next_charge_date;
  const rule = frequencyRule(sub.frequency, sub.custom_days);
  if (!base || !rule) return null;
  if (base >= today) return base;
  for (let i = firstIndexNear(base, today, rule), steps = 0; steps < MAX_STEPS; i++, steps++) {
    const date = nth(base, i, rule);
    if (date >= today) return date;
  }
  return null;
}

/** How many charges a frequency makes in an average year, if it is known. */
export function chargesPerYear(frequency: Frequency, customDays?: number | null): number | null {
  switch (frequency) {
    case "weekly":
      return 52;
    case "every_4_weeks":
      return 365.25 / 28;
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "semiannual":
      return 2;
    case "annual":
      return 1;
    case "custom":
      return 365.25 / Math.max(1, customDays ?? 30);
    case "variable":
    case "unknown":
      return null;
  }
}

type Costed = Pick<Subscription, "amount" | "frequency" | "custom_days">;

/**
 * Average monthly cost, so a yearly plan and a monthly one compare fairly,
 * or null when the price or the period is not known. Null is not zero.
 */
export function monthlyCost(sub: Costed): number | null {
  const perYear = chargesPerYear(sub.frequency, sub.custom_days);
  if (sub.amount === null || perYear === null) return null;
  return (Number(sub.amount) * perYear) / 12;
}

export function yearlyCost(sub: Costed): number | null {
  const perYear = chargesPerYear(sub.frequency, sub.custom_days);
  if (sub.amount === null || perYear === null) return null;
  return Number(sub.amount) * perYear;
}

/** The next birthday on or after `today`, given a birth date. */
export function nextBirthday(birthday: ISODate, today: ISODate): ISODate {
  const year = Number(today.slice(0, 4));
  const month = birthday.slice(5, 7);
  const day = birthday.slice(8, 10);
  // 29 February in a non-leap year is celebrated on the 28th.
  const make = (y: number) => addMonths(`${y}-${month}-01`, 0, Number(day));
  const thisYear = make(year);
  return thisYear >= today ? thisYear : make(year + 1);
}
