import { addMonths, endOfMonth, startOfMonth } from "./dates";
import { chargeDate, isSpend } from "./finance";
import type { Charge, ISODate, MoneyCategory, Subscription, Transaction } from "./model";
import { chargesBetween, monthlyCost, yearlyCost } from "./recurrence";

/**
 * A personal economy, not a bank. Four numbers per month and one chart.
 *
 * Subscriptions are recurring costs the system already knows: they are not
 * typed again as transactions. A month's "previsto" adds what was spent,
 * what is planned and what subscriptions will charge.
 */

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const euroRound = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number, { round = false } = {}): string {
  return (round ? euroRound : euro).format(amount);
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export interface MonthSummary {
  month: ISODate;
  income: number;
  /** Expenses already paid this month. */
  spent: number;
  /** Planned expenses dated this month, not paid yet. */
  planned: number;
  /** What subscriptions charge this month. */
  recurring: number;
  /** spent + planned + recurring. */
  forecast: number;
  /** income - spent. */
  balance: number;
}

export function monthSummary(
  transactions: Transaction[],
  subscriptions: Subscription[],
  anyDayInMonth: ISODate,
): MonthSummary {
  const from = startOfMonth(anyDayInMonth);
  const to = endOfMonth(anyDayInMonth);
  const inMonth = transactions.filter((t) => t.date >= from && t.date <= to);

  const income = sum(inMonth.filter((t) => t.kind === "income" && !t.planned).map((t) => Number(t.amount)));
  const spent = sum(inMonth.filter((t) => t.kind === "expense" && !t.planned).map((t) => Number(t.amount)));
  const planned = sum(inMonth.filter((t) => t.kind === "expense" && t.planned).map((t) => Number(t.amount)));
  // Unknown amounts add nothing: they are reported apart, never as 0 €.
  const recurring = sum(
    subscriptions
      .filter((s) => s.status !== "cancelled" && s.amount !== null)
      .map((s) => chargesBetween(s, from, to).length * Number(s.amount)),
  );

  return {
    month: from,
    income,
    spent,
    planned,
    recurring,
    forecast: spent + planned + recurring,
    balance: income - spent,
  };
}

/** The last `count` months, oldest first, for the bar chart. */
export function monthSeries(
  transactions: Transaction[],
  subscriptions: Subscription[],
  today: ISODate,
  count = 6,
): MonthSummary[] {
  return Array.from({ length: count }, (_, i) =>
    monthSummary(transactions, subscriptions, addMonths(startOfMonth(today), i - (count - 1))),
  );
}

export interface CategoryTotal {
  category: MoneyCategory;
  amount: number;
  share: number;
}

/** Paid expenses of the month by category, largest first. */
export function spendingByCategory(transactions: Transaction[], anyDayInMonth: ISODate): CategoryTotal[] {
  const from = startOfMonth(anyDayInMonth);
  const to = endOfMonth(anyDayInMonth);
  const totals = new Map<MoneyCategory, number>();
  for (const t of transactions) {
    if (t.kind !== "expense" || t.planned || t.date < from || t.date > to) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + Number(t.amount));
  }
  const total = sum([...totals.values()]);
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount, share: total ? amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

export interface SubscriptionTotals {
  monthly: number;
  yearly: number;
  /** Not cancelled. */
  active: number;
  /** How many of those have no comparable monthly cost yet. */
  unknown: number;
}

/**
 * What the subscriptions cost per month and per year.
 *
 * A usage-based or unconfirmed subscription has no comparable cost: it is
 * counted in `unknown` so the screen can say so instead of adding a zero.
 */
export function subscriptionTotals(subscriptions: Subscription[]): SubscriptionTotals {
  const live = subscriptions.filter((s) => s.status !== "cancelled");
  const monthly = live.map(monthlyCost);
  const yearly = live.map(yearlyCost);
  return {
    monthly: sum(monthly.filter((value): value is number => value !== null)),
    yearly: sum(yearly.filter((value): value is number => value !== null)),
    active: live.length,
    unknown: monthly.filter((value) => value === null).length,
  };
}

/** Money actually spent, from paid charges, by month. Never forecasts. */
export function spentByMonth(charges: Charge[], anyDayInMonth: ISODate): number {
  const from = startOfMonth(anyDayInMonth);
  const to = endOfMonth(anyDayInMonth);
  return sum(
    charges
      .filter((c) => {
        const date = chargeDate(c);
        return isSpend(c) && date !== null && date >= from && date <= to;
      })
      .map((c) => Number(c.amount)),
  );
}

/** Subscription charges and planned payments between two dates. */
export function upcomingPaymentsTotal(
  transactions: Transaction[],
  subscriptions: Subscription[],
  from: ISODate,
  to: ISODate,
): number {
  const planned = sum(
    transactions
      .filter((t) => t.kind === "expense" && t.planned && t.date >= from && t.date <= to)
      .map((t) => Number(t.amount)),
  );
  const charges = sum(
    subscriptions
      .filter((s) => s.status !== "cancelled" && s.amount !== null)
      .map((s) => chargesBetween(s, from, to).length * Number(s.amount)),
  );
  return planned + charges;
}
