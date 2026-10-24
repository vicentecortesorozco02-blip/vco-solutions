import type { ISODate } from "./model";

/**
 * Calendar arithmetic on plain dates ("2026-10-10").
 *
 * Everything runs in UTC on purpose: a date column has no time zone, and
 * doing the maths in the server's local zone is how "tomorrow" becomes
 * "today" at 23:00. The user's zone is applied once, when asking what day it
 * is right now (`todayIn`).
 */

const DAY_MS = 86_400_000;

export function toDate(iso: ISODate): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISO(date: Date): ISODate {
  return date.toISOString().slice(0, 10);
}

/** Today in the given IANA zone, e.g. "Europe/Madrid". */
export function todayIn(timeZone: string, now: Date = new Date()): ISODate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Current wall-clock time "HH:MM" in the given zone. */
export function timeIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
}

/** Hour of the day (0-23) in the given zone. */
export function hourIn(timeZone: string, now: Date = new Date()): number {
  return Number(timeIn(timeZone, now).slice(0, 2));
}

export function addDays(iso: ISODate, days: number): ISODate {
  return toISO(new Date(toDate(iso).getTime() + days * DAY_MS));
}

/**
 * Adds calendar months, clamping to the last day of the target month:
 * 31 January + 1 month = 28 or 29 February, never 3 March.
 */
export function addMonths(iso: ISODate, months: number, anchorDay?: number): ISODate {
  const d = toDate(iso);
  const day = anchorDay ?? d.getUTCDate();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const last = daysInMonth(target.getUTCFullYear(), target.getUTCMonth());
  target.setUTCDate(Math.min(day, last));
  return toISO(target);
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/** Whole days from `from` to `to`. Positive when `to` is later. */
export function diffDays(from: ISODate, to: ISODate): number {
  return Math.round((toDate(to).getTime() - toDate(from).getTime()) / DAY_MS);
}

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: ISODate): ISODate {
  const weekday = (toDate(iso).getUTCDay() + 6) % 7; // 0 = Monday
  return addDays(iso, -weekday);
}

export function startOfMonth(iso: ISODate): ISODate {
  return `${iso.slice(0, 7)}-01`;
}

export function endOfMonth(iso: ISODate): ISODate {
  const d = toDate(iso);
  const last = daysInMonth(d.getUTCFullYear(), d.getUTCMonth());
  return `${iso.slice(0, 7)}-${String(last).padStart(2, "0")}`;
}

export function isBetween(iso: ISODate, from: ISODate, to: ISODate): boolean {
  return iso >= from && iso <= to;
}

export function eachDay(from: ISODate, to: ISODate): ISODate[] {
  const days: ISODate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return days;
}

/** "09:30:00" -> "09:30". */
export function shortTime(time: string | null | undefined): string | null {
  return time ? time.slice(0, 5) : null;
}

// ---------------------------------------------------------------------------
// Spanish formatting
// ---------------------------------------------------------------------------

const LOCALE = "es-ES";

function fmt(iso: ISODate, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", ...options }).format(toDate(iso));
}

/** "sábado, 10 de octubre" */
export function formatLong(iso: ISODate): string {
  return fmt(iso, { weekday: "long", day: "numeric", month: "long" });
}

/** "10 oct" */
export function formatShort(iso: ISODate): string {
  return fmt(iso, { day: "numeric", month: "short" }).replace(".", "");
}

/** "10 oct 2026" */
export function formatWithYear(iso: ISODate): string {
  return fmt(iso, { day: "numeric", month: "short", year: "numeric" }).replace(".", "");
}

/** "octubre de 2026" */
export function formatMonth(iso: ISODate): string {
  return fmt(iso, { month: "long", year: "numeric" });
}

/** "lun" */
export function formatWeekdayShort(iso: ISODate): string {
  return fmt(iso, { weekday: "short" }).replace(".", "");
}

/** "hoy", "mañana", "ayer", "en 5 días", "hace 3 días", "en 2 meses". */
export function relativeDay(iso: ISODate, today: ISODate): string {
  const days = diffDays(today, iso);
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  if (days === -1) return "ayer";
  const abs = Math.abs(days);
  const amount =
    abs < 60 ? `${abs} días` : abs < 730 ? `${Math.round(abs / 30)} meses` : `${Math.round(abs / 365)} años`;
  return days > 0 ? `en ${amount}` : `hace ${amount}`;
}

/** "quedan 2 días", "queda 1 día", "hoy", "vencido hace 3 días". */
export function countdown(iso: ISODate, today: ISODate): string {
  const days = diffDays(today, iso);
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  if (days > 1) return `quedan ${days} días`;
  return days === -1 ? "venció ayer" : `venció hace ${-days} días`;
}

export function greeting(hour: number): string {
  if (hour >= 6 && hour < 14) return "Buenos días";
  if (hour >= 14 && hour < 21) return "Buenas tardes";
  return "Buenas noches";
}
