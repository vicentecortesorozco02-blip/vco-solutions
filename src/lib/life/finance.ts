import { addDays, diffDays } from "./dates";
import type {
  Account,
  Charge,
  Confidence,
  ISODate,
  Project,
  Subscription,
  SubscriptionPrice,
} from "./model";
import { HOME_CURRENCY, countsAsSpent, isHomeCurrency, isInternalTransfer } from "./model";
import { canForecast, chargesBetween, monthlyCost, nextCharge } from "./recurrence";

/**
 * Personal finance: what is paid, what is owed, and how sure we are.
 *
 * Three ideas hold this file together:
 *
 *  1. A charge is history. A forecast is arithmetic. They are never added
 *     together, and a forecast that has gone by without a matching charge is
 *     "pendiente de comprobar" — not paid, and not unpaid either.
 *  2. An unknown amount is null, never 0. Totals count what they can and say
 *     out loud how many figures they had to leave out.
 *  3. Confirmed figures and estimates are added separately, so a total never
 *     pretends an approximate 5 €/mes is as solid as a confirmed 32 €.
 *
 * A bank can pay an instalment late: Grover's "cuota del 30" was paid on the
 * 15th of the following month. So a charge is matched to the forecast it
 * settles by its own due date when it has one, and otherwise by proximity,
 * inside MATCH_WINDOW days.
 */

const MATCH_WINDOW = 20;

/** When the money actually moved, as best as the record knows. */
export function chargeDate(charge: Charge): ISODate | null {
  return charge.operation_date ?? charge.value_date ?? charge.booking_date ?? charge.reported_on;
}

/**
 * Charges that are money gone: `paid`, not counted twice, not a transfer
 * between your own accounts — that one only changes pocket.
 */
export function isSpend(charge: Charge): boolean {
  return (
    countsAsSpent(charge.status) &&
    charge.mirror_of_id === null &&
    !isInternalTransfer(charge.kind)
  );
}

/**
 * Lo que hay en las cuentas, según el último saldo apuntado en cada una.
 *
 * No es lo que dice el banco ahora: es lo que tú apuntaste y cuándo. Una
 * cuenta sin saldo no cuenta como 0 €, se cuenta aparte.
 */
export function availableTotal(accounts: Account[]): Total {
  return accounts.reduce(
    (total, account) => addToTotal(total, account.balance, account.balance_status),
    emptyTotal,
  );
}

/** El saldo apuntado hace más de `days` días: una foto que ya está vieja. */
export function staleBalances(accounts: Account[], today: ISODate, days = 30): Account[] {
  return accounts.filter(
    (account) =>
      account.balance !== null &&
      (account.balance_as_of === null || diffDays(account.balance_as_of, today) > days),
  );
}

export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

// ---------------------------------------------------------------------------
// Totals that admit what they do not know
// ---------------------------------------------------------------------------

export interface Total {
  /** Figures marked as confirmed. */
  confirmed: number;
  /** Observed, communicated or approximate figures. */
  estimated: number;
  /** How many items had no figure at all. */
  unknown: number;
  /** How many items were in another currency, so they stayed out. */
  foreign: number;
}

export const emptyTotal: Total = { confirmed: 0, estimated: 0, unknown: 0, foreign: 0 };

/**
 * A total is in euros. An amount in another currency is counted apart, never
 * added: without an exchange rate there is no honest way to mix them, and an
 * invented rate would be worse than the gap.
 */
export function addToTotal(
  total: Total,
  amount: number | null,
  confidence: Confidence,
  currency: string = HOME_CURRENCY,
): Total {
  if (amount === null || confidence === "unknown") return { ...total, unknown: total.unknown + 1 };
  if (!isHomeCurrency(currency)) return { ...total, foreign: total.foreign + 1 };
  if (confidence === "confirmed") return { ...total, confirmed: total.confirmed + amount };
  return { ...total, estimated: total.estimated + amount };
}

export const totalOf = (
  items: { amount: number | null; confidence: Confidence; currency?: string }[],
): Total =>
  items.reduce((total, item) => addToTotal(total, item.amount, item.confidence, item.currency), emptyTotal);

/** Both parts together, for a single headline figure. */
export const totalSum = (total: Total) => total.confirmed + total.estimated;

// ---------------------------------------------------------------------------
// The payment plan: forecasts and charges, side by side
// ---------------------------------------------------------------------------

export type PaymentState = "paid" | "forecast" | "unchecked" | "failed" | "cancelled" | "pending";

export const paymentStateLabel: Record<PaymentState, string> = {
  paid: "Pagado",
  forecast: "Previsto",
  unchecked: "Pendiente de comprobar",
  failed: "Fallido",
  cancelled: "Cancelado",
  pending: "Pendiente de pago",
};

export interface Payment {
  /** Stable within a render: the forecast date or the charge id. */
  key: string;
  date: ISODate;
  state: PaymentState;
  name: string;
  /** Null when the amount is not known. */
  amount: number | null;
  /** The currency the amount is in. Only euros reach a total. */
  currency: string;
  confidence: Confidence;
  subscriptionId: string | null;
  chargeId: string | null;
  accountId: string | null;
  projectId: string | null;
  /** Why the date is what it is: "cuota del 30", "fecha valor"… */
  note: string | null;
}

interface PlanInput {
  subscriptions: Subscription[];
  charges: Charge[];
}

/**
 * Every payment between two dates: the charges that happened and the
 * forecasts that did not find one.
 *
 * Cancelled subscriptions produce no forecasts. Usage-based and
 * unconfirmed ones produce none either: there is nothing to repeat.
 */
export function buildPaymentPlan(data: PlanInput, from: ISODate, to: ISODate, today: ISODate): Payment[] {
  const out: Payment[] = [];
  const used = new Set<string>();

  const bySubscription = new Map<string, Charge[]>();
  for (const charge of data.charges) {
    const id = charge.subscription_id;
    if (!id || charge.mirror_of_id !== null) continue;
    bySubscription.set(id, [...(bySubscription.get(id) ?? []), charge]);
  }

  // Forecasts first, so each can claim the charge that settles it.
  for (const sub of data.subscriptions) {
    if (sub.status === "cancelled" || !canForecast(sub)) continue;
    const candidates = bySubscription.get(sub.id) ?? [];

    for (const date of chargesBetween(sub, from, to)) {
      const match = matchCharge(candidates, date, used);
      if (match) {
        used.add(match.id);
        out.push(fromCharge(match, sub));
        continue;
      }
      out.push({
        key: `${sub.id}:${date}`,
        date,
        state: date < today ? "unchecked" : "forecast",
        name: sub.name,
        amount: sub.amount === null ? null : Number(sub.amount),
        currency: sub.currency,
        confidence: worst(sub.amount_status, sub.date_status),
        subscriptionId: sub.id,
        chargeId: null,
        accountId: sub.observed_account_id,
        projectId: sub.project_id,
        note: null,
      });
    }
  }

  // Then every charge in range that no forecast claimed: fees, invoices,
  // unidentified charges and payments outside the expected rhythm.
  const subscriptionById = new Map(data.subscriptions.map((s) => [s.id, s]));
  for (const charge of data.charges) {
    if (used.has(charge.id) || charge.mirror_of_id !== null) continue;
    const date = chargeDate(charge);
    if (!date || date < from || date > to) continue;
    out.push(fromCharge(charge, charge.subscription_id ? subscriptionById.get(charge.subscription_id) : undefined));
  }

  return out.sort((a, b) => (a.date === b.date ? a.name.localeCompare(b.name, "es") : a.date < b.date ? -1 : 1));
}

/** The charge that settles a forecast: by its own due date, or by proximity. */
function matchCharge(candidates: Charge[], date: ISODate, used: Set<string>): Charge | null {
  const free = candidates.filter((c) => !used.has(c.id) && c.status !== "authorization");
  const byDue = free.find((c) => c.due_date === date);
  if (byDue) return byDue;

  let best: { charge: Charge; distance: number } | null = null;
  for (const charge of free) {
    if (charge.due_date) continue; // It settles another instalment.
    const when = chargeDate(charge);
    if (!when) continue;
    const distance = Math.abs(diffDays(date, when));
    if (distance <= MATCH_WINDOW && (!best || distance < best.distance)) best = { charge, distance };
  }
  return best?.charge ?? null;
}

function fromCharge(charge: Charge, sub?: Subscription): Payment {
  const state: PaymentState =
    charge.status === "paid"
      ? "paid"
      : charge.status === "failed"
        ? "failed"
        : charge.status === "pending"
          ? "pending"
          : charge.status === "authorization"
            ? "forecast"
            : "cancelled";
  return {
    key: `charge:${charge.id}`,
    date: chargeDate(charge) ?? charge.created_at.slice(0, 10),
    state,
    name: charge.description || sub?.name || charge.merchant || "Cargo",
    amount: Number(charge.amount),
    currency: charge.currency,
    // What a bank or an invoice says happened is as firm as it gets.
    confidence: "confirmed",
    subscriptionId: charge.subscription_id,
    chargeId: charge.id,
    accountId: charge.account_id,
    projectId: charge.project_id ?? sub?.project_id ?? null,
    note: charge.period_label ? `cuota ${charge.period_label}` : charge.notes,
  };
}

const RANK: Confidence[] = ["confirmed", "observed", "communicated", "approximate", "unknown"];
/** The weaker of two confidences: a total is only as firm as its softest part. */
export const worst = (a: Confidence, b: Confidence): Confidence =>
  RANK.indexOf(a) >= RANK.indexOf(b) ? a : b;

// ---------------------------------------------------------------------------
// Views the summary screen needs
// ---------------------------------------------------------------------------

/** Forecasts and unpaid invoices from today on: what is coming, not history. */
export function upcoming(data: PlanInput, today: ISODate, days: number): Payment[] {
  return buildPaymentPlan(data, today, addDays(today, days - 1), today).filter(
    (p) => p.state === "forecast" || p.state === "pending",
  );
}

export const upcomingTotal = (payments: Payment[]): Total =>
  totalOf(payments.map((p) => ({ amount: p.amount, confidence: p.confidence, currency: p.currency })));

/** What subscriptions cost per month, split by how sure the figures are. */
export function recurringMonthly(subscriptions: Subscription[]): Total {
  return subscriptions
    .filter((s) => s.status !== "cancelled")
    .reduce((total, sub) => {
      const cost = monthlyCost(sub);
      return addToTotal(
        total,
        cost,
        cost === null ? "unknown" : worst(sub.amount_status, sub.date_status),
        sub.currency,
      );
    }, emptyTotal);
}

export interface ScopeTotals {
  personal: Total;
  pending: Total;
  byProject: { project: Project | null; total: Total }[];
}

/**
 * Monthly cost split between personal spending and each project's.
 * Anything not accredited to a project stays in "sin clasificar".
 */
export function monthlyByScope(subscriptions: Subscription[], projects: Project[]): ScopeTotals {
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const perProject = new Map<string, Total>();
  let personal = emptyTotal;
  let pending = emptyTotal;

  for (const sub of subscriptions) {
    if (sub.status === "cancelled") continue;
    const cost = monthlyCost(sub);
    const confidence = cost === null ? "unknown" : worst(sub.amount_status, sub.date_status);
    if (sub.scope === "project" && sub.project_id) {
      perProject.set(
        sub.project_id,
        addToTotal(perProject.get(sub.project_id) ?? emptyTotal, cost, confidence, sub.currency),
      );
    } else if (sub.scope === "personal") {
      personal = addToTotal(personal, cost, confidence, sub.currency);
    } else {
      pending = addToTotal(pending, cost, confidence, sub.currency);
    }
  }

  return {
    personal,
    pending,
    byProject: [...perProject.entries()]
      .map(([id, total]) => ({ project: projectById.get(id) ?? null, total }))
      .sort((a, b) => totalSum(b.total) - totalSum(a.total)),
  };
}

/** Charges nobody has put a name to yet, newest first. */
export const unidentified = (charges: Charge[]): Charge[] =>
  charges
    .filter((c) => !c.identified)
    .sort((a, b) => ((chargeDate(a) ?? "") < (chargeDate(b) ?? "") ? 1 : -1));

/** Invoices and charges still waiting to be paid. */
export const awaitingPayment = (charges: Charge[]): Charge[] =>
  charges.filter((c) => c.status === "pending").sort((a, b) => ((chargeDate(a) ?? "") < (chargeDate(b) ?? "") ? 1 : -1));

export const toReview = (subscriptions: Subscription[]): Subscription[] =>
  subscriptions.filter((s) => s.status === "review");

export const cancelPending = (subscriptions: Subscription[]): Subscription[] =>
  subscriptions.filter((s) => s.status === "cancel_pending");

/** Subscriptions meant to move to another account, still to be confirmed. */
export const accountChangesPending = (subscriptions: Subscription[]): Subscription[] =>
  subscriptions.filter((s) => s.account_change === "pending" && s.status !== "cancelled");

/** Figures or dates the user still has to confirm, as a plain count. */
export function pendingConfirmations(subscriptions: Subscription[], domains: { renews_status: Confidence }[]) {
  const live = subscriptions.filter((s) => s.status !== "cancelled");
  return {
    amounts: live.filter((s) => s.amount === null || s.amount_status === "unknown").length,
    estimatedAmounts: live.filter((s) => s.amount !== null && s.amount_status !== "confirmed" && s.amount_status !== "unknown").length,
    dates: live.filter((s) => s.next_charge_date === null || s.date_status === "unknown").length,
    taxes: live.filter((s) => s.tax === "unknown").length,
    domainDates: domains.filter((d) => d.renews_status === "unknown").length,
  };
}

/** Money actually spent per account, from paid charges in a date range. */
export function spentByAccount(charges: Charge[], accounts: Account[], from: ISODate, to: ISODate) {
  const totals = new Map<string, number>();
  for (const charge of charges) {
    const date = chargeDate(charge);
    if (!isSpend(charge) || !date || date < from || date > to) continue;
    // Only euros: a dollar charge is not spending in euros.
    if (!isHomeCurrency(charge.currency)) continue;
    const key = charge.account_id ?? "";
    totals.set(key, (totals.get(key) ?? 0) + Number(charge.amount));
  }
  return accounts
    .map((account) => ({ account, amount: totals.get(account.id) ?? 0 }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/** The price a subscription had over time, newest first. */
export function priceHistory(prices: SubscriptionPrice[], subscriptionId: string): SubscriptionPrice[] {
  return prices
    .filter((p) => p.subscription_id === subscriptionId)
    .sort((a, b) => ((a.effective_on ?? a.created_at) < (b.effective_on ?? b.created_at) ? 1 : -1));
}

/** Charges of one subscription, newest first, authorisations included. */
export function chargeHistory(charges: Charge[], subscriptionId: string): Charge[] {
  return charges
    .filter((c) => c.subscription_id === subscriptionId || c.candidate_subscription_id === subscriptionId)
    .sort((a, b) => ((chargeDate(a) ?? "") < (chargeDate(b) ?? "") ? 1 : -1));
}

/** The next date to show for a subscription, with why it is uncertain. */
export function nextChargeView(sub: Subscription, today: ISODate): { date: ISODate | null; confidence: Confidence } {
  if (sub.status === "cancelled") return { date: null, confidence: "unknown" };
  const rolled = nextCharge(sub, today);
  if (rolled) return { date: rolled, confidence: sub.date_status };
  // Sin frecuencia no hay serie que adelantar, pero una fecha futura que te
  // han comunicado sigue siendo una fecha: no se tira.
  if (sub.next_charge_date && sub.next_charge_date >= today) {
    return { date: sub.next_charge_date, confidence: sub.date_status };
  }
  return { date: null, confidence: sub.date_status };
}
