import { describe, expect, it } from "vitest";

import { buildAgenda, emptyLifeData, type LifeData } from "./agenda";
import { addMonths, countdown, diffDays, relativeDay, startOfWeek, todayIn } from "./dates";
import { parseEntityForm } from "./entities";
import { monthSummary, subscriptionTotals, upcomingPaymentsTotal } from "./money";
import type { CalendarEvent, Charge, Partner, ProjectPartner, Subscription, Task, Transaction } from "./model";
import {
  buildPaymentPlan,
  monthlyByScope,
  pendingConfirmations,
  recurringMonthly,
  totalSum,
  upcoming,
  upcomingTotal,
} from "./finance";
import { partnerBalances, projectCharges, projectPaidBy, splitOf } from "./partners";
import { canForecast, chargesBetween, eventOccurrences, monthlyCost, nextBirthday, nextCharge } from "./recurrence";
import { deriveReminders, domainLevel, topPriorities } from "./reminders";

const row = { created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };

function sub(partial: Partial<Subscription>): Subscription {
  return {
    ...row,
    id: "s1",
    name: "Vercel",
    company: null,
    category: "hosting",
    amount: 20,
    amount_status: "confirmed",
    amount_as_of: null,
    currency: "EUR",
    frequency: "monthly",
    custom_days: null,
    next_charge_date: "2026-01-31",
    date_status: "confirmed",
    tax: "unknown",
    status: "active",
    scope: "personal",
    merchant: null,
    observed_account_id: null,
    target_account_id: null,
    account_change: "none",
    commitment: null,
    commitment_until: null,
    payment_method: null,
    project_id: null,
    url: null,
    notes: null,
    source: null,
    active: true,
    ...partial,
  };
}

function charge(partial: Partial<Charge>): Charge {
  return {
    ...row,
    id: "c1",
    counterpart_account_id: null,
    description: "Cargo",
    kind: "payment",
    status: "paid",
    amount: 20,
    currency: "EUR",
    operation_date: null,
    value_date: null,
    booking_date: null,
    reported_on: null,
    due_date: null,
    period_label: null,
    merchant: null,
    channel: null,
    subscription_id: null,
    domain_id: null,
    paid_by_partner_id: null,
    shared: false,
    candidate_subscription_id: null,
    identified: true,
    mirror_of_id: null,
    account_id: null,
    project_id: null,
    notes: null,
    source: null,
    ...partial,
  };
}

function task(partial: Partial<Task>): Task {
  return {
    ...row,
    id: "t1",
    title: "Tarea",
    description: null,
    due_date: null,
    due_time: null,
    priority: "normal",
    status: "pending",
    category: null,
    project_id: null,
    course_id: null,
    completed_at: null,
    position: 0,
    ...partial,
  };
}

function event(partial: Partial<CalendarEvent>): CalendarEvent {
  return {
    ...row,
    id: "e1",
    title: "Evento",
    date: "2026-10-10",
    end_date: null,
    start_time: null,
    end_time: null,
    category: "personal",
    location: null,
    notes: null,
    recurrence: "none",
    recurrence_interval: 1,
    recurrence_until: null,
    reminder_minutes: null,
    ...partial,
  };
}

function tx(partial: Partial<Transaction>): Transaction {
  return {
    ...row,
    id: "x1",
    account_id: null,
    source: null,
    kind: "expense",
    amount: 10,
    date: "2026-10-05",
    category: "food",
    description: null,
    planned: false,
    project_id: null,
    ...partial,
  };
}

const data = (partial: Partial<LifeData>): LifeData => ({ ...emptyLifeData, ...partial });

describe("dates", () => {
  it("clamps month arithmetic to the end of the month", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
    expect(addMonths("2026-12-15", 1)).toBe("2027-01-15");
  });

  it("starts weeks on Monday", () => {
    expect(startOfWeek("2026-10-10")).toBe("2026-10-05"); // Saturday -> Monday
    expect(startOfWeek("2026-10-05")).toBe("2026-10-05");
    expect(startOfWeek("2026-10-11")).toBe("2026-10-05"); // Sunday
  });

  it("knows what day it is in Madrid, not in UTC", () => {
    // 23:30 UTC on 9 October is already 10 October in Madrid (UTC+2).
    expect(todayIn("Europe/Madrid", new Date("2026-10-09T23:30:00Z"))).toBe("2026-10-10");
  });

  it("speaks Spanish about distances", () => {
    expect(relativeDay("2026-10-11", "2026-10-10")).toBe("mañana");
    expect(relativeDay("2026-10-07", "2026-10-10")).toBe("hace 3 días");
    expect(countdown("2026-10-12", "2026-10-10")).toBe("quedan 2 días");
    expect(countdown("2026-10-08", "2026-10-10")).toBe("venció hace 2 días");
    expect(diffDays("2026-10-10", "2026-12-25")).toBe(76);
  });
});

describe("recurrence", () => {
  it("keeps monthly charges on the 31st when the month allows it", () => {
    const charges = chargesBetween(sub({ next_charge_date: "2026-01-31" }), "2026-01-01", "2026-04-30");
    expect(charges).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"]);
  });

  it("rolls a past next charge forward", () => {
    expect(nextCharge(sub({ next_charge_date: "2026-01-31" }), "2026-10-10")).toBe("2026-10-31");
    expect(nextCharge(sub({ frequency: "every_4_weeks", next_charge_date: "2026-09-01" }), "2026-10-10")).toBe("2026-10-27");
    expect(nextCharge(sub({ frequency: "annual", next_charge_date: "2026-11-01" }), "2026-10-10")).toBe("2026-11-01");
  });

  it("normalises any frequency to a monthly cost", () => {
    expect(monthlyCost(sub({ amount: 120, frequency: "annual" }))).toBe(10);
    expect(monthlyCost(sub({ amount: 12, frequency: "monthly" }))).toBe(12);
    // 365,25 / 28 = 13,04 cobros al año, no 13 redondos.
    expect(monthlyCost(sub({ amount: 10, frequency: "every_4_weeks" }))).toBeCloseTo(10.87, 2);
    expect(monthlyCost(sub({ amount: 30, frequency: "custom", custom_days: 30 }))).toBeCloseTo(30.44, 2);
  });

  it("expands weekly events and respects the end date", () => {
    const weekly = event({ date: "2026-10-01", recurrence: "weekly", recurrence_until: "2026-10-20" });
    expect(eventOccurrences(weekly, "2026-10-01", "2026-10-31")).toEqual([
      "2026-10-01",
      "2026-10-08",
      "2026-10-15",
    ]);
  });

  it("shows a multi-day trip on every day it covers", () => {
    const trip = event({ date: "2026-10-09", end_date: "2026-10-12", category: "travel" });
    expect(eventOccurrences(trip, "2026-10-11", "2026-10-11")).toEqual(["2026-10-09"]);
  });

  it("finds yearly events far from their first date", () => {
    const anniversary = event({ date: "2010-03-14", recurrence: "yearly" });
    expect(eventOccurrences(anniversary, "2026-01-01", "2026-12-31")).toEqual(["2026-03-14"]);
  });

  it("moves 29 February birthdays to the 28th in common years", () => {
    expect(nextBirthday("2004-02-29", "2026-01-10")).toBe("2026-02-28");
    expect(nextBirthday("1990-03-01", "2026-10-10")).toBe("2027-03-01");
  });
});

describe("money", () => {
  it("summarises a month without counting planned payments as spent", () => {
    const transactions = [
      tx({ id: "a", amount: 50, date: "2026-10-02" }),
      tx({ id: "b", amount: 1000, kind: "income", category: "income", date: "2026-10-01" }),
      tx({ id: "c", amount: 300, planned: true, date: "2026-10-20" }),
      tx({ id: "d", amount: 999, date: "2026-09-30" }),
    ];
    const s = monthSummary(transactions, [sub({ amount: 20, next_charge_date: "2026-10-15" })], "2026-10-10");
    expect(s).toMatchObject({ income: 1000, spent: 50, planned: 300, recurring: 20, forecast: 370, balance: 950 });
  });

  it("totals subscriptions per month and year, ignoring cancelled ones", () => {
    const totals = subscriptionTotals([
      sub({ id: "1", amount: 10 }),
      sub({ id: "2", amount: 120, frequency: "annual" }),
      sub({ id: "3", amount: 99, status: "cancelled" }),
      sub({ id: "4", amount: null, amount_status: "unknown", frequency: "variable" }),
    ]);
    expect(totals).toEqual({ monthly: 20, yearly: 240, active: 3, unknown: 1 });
  });

  it("adds charges and planned payments in a window", () => {
    const total = upcomingPaymentsTotal(
      [tx({ amount: 30, planned: true, date: "2026-10-12" })],
      [sub({ amount: 20, next_charge_date: "2026-10-14" })],
      "2026-10-10",
      "2026-10-16",
    );
    expect(total).toBe(50);
  });
});

describe("reminders and priorities", () => {
  const today = "2026-10-10";

  it("warns about domains at 30, 15 and 7 days", () => {
    expect(domainLevel(31)).toBeNull();
    expect(domainLevel(30)).toBe("info");
    expect(domainLevel(15)).toBe("soon");
    expect(domainLevel(7)).toBe("critical");
    expect(domainLevel(-1)).toBe("critical");
  });

  it("flags overdue tasks and an exam a week away", () => {
    const reminders = deriveReminders(
      data({
        tasks: [task({ id: "late", title: "Pagar IBI", due_date: "2026-10-08" })],
        courses: [{ ...row, id: "c1", name: "Cálculo", teacher: null, schedule: null, room: null, url: null, notes: null, active: true }],
        courseItems: [
          {
            ...row,
            id: "ex",
            course_id: "c1",
            kind: "exam",
            title: "Parcial",
            due_date: "2026-10-17",
            due_time: null,
            status: "pending",
            priority: "high",
            grade: null,
            description: null,
            url: null,
          },
        ],
      }),
      today,
    );
    expect(reminders[0]).toMatchObject({ key: "task:late", level: "critical" });
    expect(reminders.find((r) => r.kind === "exam")).toMatchObject({
      title: "Examen de Cálculo",
      detail: "Parcial · dentro de 7 días",
    });
  });

  it("returns at most three priorities, overdue first", () => {
    const focus = topPriorities(
      data({
        tasks: [
          task({ id: "a", title: "Hoy normal", due_date: today }),
          task({ id: "b", title: "Atrasada", due_date: "2026-10-01" }),
          task({ id: "c", title: "Hoy urgente", due_date: today, priority: "urgent" }),
          task({ id: "d", title: "En curso", status: "in_progress" }),
          task({ id: "e", title: "Hecha", due_date: today, status: "done" }),
        ],
      }),
      today,
    );
    expect(focus.map((f) => f.title)).toEqual(["Atrasada", "Hoy urgente", "Hoy normal"]);
  });

  it("puts every module on one agenda", () => {
    const items = buildAgenda(
      data({
        events: [event({ id: "e", date: today, start_time: "09:00:00" })],
        tasks: [task({ id: "t", due_date: today })],
        subscriptions: [sub({ id: "s", next_charge_date: today })],
        contacts: [
          {
            ...row,
            id: "p",
            name: "Marta",
            phone: null,
            email: null,
            company: null,
            relationship: null,
            birthday: "1999-10-10",
            notes: null,
            last_interaction: null,
            next_action: null,
            next_action_date: null,
          },
        ],
      }),
      today,
      today,
    );
    // Timed first, then untimed by title: Marta, Tarea, Vercel.
    expect(items.map((i) => i.kind)).toEqual(["event", "birthday", "task", "charge"]);
    expect(items[0]).toMatchObject({ time: "09:00" });
  });
});

describe("entity forms", () => {
  const form = (values: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(values)) f.set(k, v);
    return f;
  };

  it("turns blanks into nulls and commas into decimals", () => {
    const result = parseEntityForm(
      "subscription",
      form({
        name: " Supabase ",
        amount: "25,50",
        amount_status: "observed",
        frequency: "monthly",
        next_charge_date: "2026-11-01",
        date_status: "observed",
        category: "hosting",
        url: "supabase.com",
      }),
    );
    expect(result.ok).toBe(true);
    expect(result.values).toMatchObject({ name: "Supabase", amount: 25.5, company: null, url: "https://supabase.com" });
  });

  it("alinea el importe con su confianza en vez de negarse a guardar", () => {
    // Antes esto devolvía un error de campo y no se guardaba nada. Lo que la
    // base exige es que la pareja cuadre, no que la rellene el usuario a mano.
    const typed = parseEntityForm(
      "subscription",
      form({ name: "Local", amount: "145", amount_status: "unknown", frequency: "monthly", date_status: "unknown" }),
    );
    expect(typed.ok).toBe(true);
    expect(typed.values.amount).toBe(145);
    expect(typed.values.amount_status).toBe("confirmed");

    const noAmount = parseEntityForm(
      "subscription",
      form({ name: "Local", amount: "", amount_status: "communicated", frequency: "monthly", date_status: "unknown" }),
    );
    expect(noAmount.ok).toBe(true);
    expect(noAmount.values.amount).toBeNull();
    expect(noAmount.values.amount_status).toBe("unknown");
  });

  it("explains a missing required field in Spanish", () => {
    const result = parseEntityForm("task", form({ title: "  " }));
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.title).toBe("Falta «Qué hay que hacer»");
  });

  it("asks for the interval of a custom frequency", () => {
    const result = parseEntityForm(
      "subscription",
      form({ name: "Gym", amount: "30", frequency: "custom", next_charge_date: "2026-11-01", category: "gym" }),
    );
    expect(result.fieldErrors.custom_days).toBeDefined();
  });

  it("rejects values outside the allowed lists", () => {
    const result = parseEntityForm("task", form({ title: "x", priority: "imposible", status: "pending" }));
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.priority).toBeDefined();
  });
});

describe("finanzas: previsiones honestas", () => {
  // The series the user calculated by hand, 28 days apart from 01/09/2026.
  const fp = sub({
    id: "fp",
    name: "FP",
    amount: 32,
    frequency: "every_4_weeks",
    next_charge_date: "2026-09-29",
    date_status: "confirmed",
  });

  it("cada 4 semanas son 28 días exactos", () => {
    expect(chargesBetween(fp, "2026-09-01", "2027-02-28")).toEqual([
      "2026-09-29",
      "2026-10-27",
      "2026-11-24",
      "2026-12-22",
      "2027-01-19",
      "2027-02-16",
    ]);
  });

  it("un retraso bancario no desplaza la serie", () => {
    // A charge paid late does not move the next forecast.
    const plan = buildPaymentPlan(
      { subscriptions: [fp], charges: [charge({ id: "late", subscription_id: "fp", amount: 32, operation_date: "2026-10-02" })] },
      "2026-09-20",
      "2026-11-30",
      "2026-11-01",
    );
    expect(plan.map((p) => p.date)).toEqual(["2026-10-02", "2026-10-27", "2026-11-24"]);
    expect(plan[0].state).toBe("paid");
    expect(plan[1].state).toBe("unchecked");
    expect(plan[2].state).toBe("forecast");
  });

  it("una previsión pasada sin cargo no es un impago, es algo que comprobar", () => {
    const plan = buildPaymentPlan({ subscriptions: [fp], charges: [] }, "2026-09-01", "2026-10-31", "2026-10-15");
    expect(plan.map((p) => p.state)).toEqual(["unchecked", "forecast"]);
  });

  it("lo variable y lo no confirmado no generan previsiones", () => {
    expect(canForecast(sub({ frequency: "variable", next_charge_date: "2026-10-20" }))).toBe(false);
    expect(canForecast(sub({ frequency: "unknown", next_charge_date: "2026-10-20" }))).toBe(false);
    expect(canForecast(sub({ frequency: "monthly", next_charge_date: null, date_status: "unknown" }))).toBe(false);
    expect(nextCharge(sub({ frequency: "variable" }), "2026-10-10")).toBeNull();
    expect(monthlyCost(sub({ frequency: "variable" }))).toBeNull();
    expect(monthlyCost(sub({ amount: null, amount_status: "unknown" }))).toBeNull();
  });

  it("una suscripción cancelada no genera cobros nuevos", () => {
    const cancelled = sub({ id: "x", status: "cancelled", next_charge_date: "2026-10-20" });
    expect(buildPaymentPlan({ subscriptions: [cancelled], charges: [] }, "2026-10-01", "2026-12-31", "2026-10-15")).toEqual([]);
    expect(recurringMonthly([cancelled])).toEqual({ confirmed: 0, estimated: 0, unknown: 0, foreign: 0 });
  });

  it("una autorización y un intento fallido no cuentan como pago", () => {
    const spotify = sub({ id: "sp", name: "Spotify", amount: 6.49, next_charge_date: "2026-08-18" });
    const plan = buildPaymentPlan(
      {
        subscriptions: [spotify],
        charges: [
          charge({ id: "auth", subscription_id: "sp", amount: 6.49, status: "authorization", operation_date: "2026-08-18" }),
          charge({ id: "ok", subscription_id: "sp", amount: 6.49, operation_date: "2026-08-18" }),
        ],
      },
      "2026-08-01",
      "2026-08-31",
      "2026-09-30",
    );
    // The forecast is settled by the payment, and the authorisation shows apart.
    const paid = plan.filter((p) => p.state === "paid");
    expect(paid).toHaveLength(1);
    expect(paid[0].chargeId).toBe("ok");
    expect(plan.filter((p) => p.state === "unchecked")).toHaveLength(0);
  });

  it("un pago visto en PayPal y en el banco se cuenta una vez", () => {
    const sub1 = sub({ id: "m", name: "Microsoft 365", amount: 101.49, frequency: "annual", next_charge_date: "2026-08-06" });
    const plan = buildPaymentPlan(
      {
        subscriptions: [sub1],
        charges: [
          charge({ id: "paypal", subscription_id: "m", amount: 101.49, operation_date: "2026-08-06" }),
          charge({ id: "banco", subscription_id: "m", amount: 101.49, operation_date: "2026-08-07", mirror_of_id: "paypal" }),
        ],
      },
      "2026-08-01",
      "2026-08-31",
      "2026-09-01",
    );
    expect(plan).toHaveLength(1);
    expect(plan[0].amount).toBe(101.49);
  });

  it("una cuota pagada tarde se asigna a su cuota, no a la siguiente", () => {
    const grover = sub({ id: "g", name: "Grover", amount: 32.9, next_charge_date: "2026-06-30" });
    const plan = buildPaymentPlan(
      {
        subscriptions: [grover],
        charges: [
          charge({ id: "jun", subscription_id: "g", amount: 32.9, operation_date: "2026-08-01", due_date: "2026-06-30", period_label: "Jun 30" }),
          charge({ id: "jul", subscription_id: "g", amount: 32.9, operation_date: "2026-08-15", due_date: "2026-07-30", period_label: "Jul 30" }),
        ],
      },
      "2026-06-01",
      "2026-07-31",
      "2026-09-01",
    );
    expect(plan.map((p) => p.chargeId)).toEqual(["jun", "jul"]);
  });

  it("separa lo confirmado de lo estimado y no cuenta lo desconocido como 0", () => {
    const list = [
      sub({ id: "a", amount: 32, amount_status: "confirmed", next_charge_date: "2026-10-20" }),
      sub({ id: "b", amount: 5, amount_status: "approximate", next_charge_date: "2026-10-21" }),
      sub({ id: "c", amount: null, amount_status: "unknown", frequency: "variable", next_charge_date: null, date_status: "unknown" }),
    ];
    const total = recurringMonthly(list);
    expect(total.confirmed).toBe(32);
    expect(total.estimated).toBe(5);
    expect(total.unknown).toBe(1);

    const next = upcoming({ subscriptions: list, charges: [] }, "2026-10-15", 30);
    const sum = upcomingTotal(next);
    expect(sum.confirmed).toBe(32);
    expect(sum.estimated).toBe(5);
    expect(totalSum(sum)).toBe(37);
  });

  it("solo clasifica por proyecto lo acreditado", () => {
    const scopes = monthlyByScope(
      [
        sub({ id: "p", amount: 10, scope: "project", project_id: "proj" }),
        sub({ id: "q", amount: 7, scope: "pending" }),
      ],
      [],
    );
    expect(totalSum(scopes.byProject[0].total)).toBe(10);
    expect(totalSum(scopes.pending)).toBe(7);
    expect(totalSum(scopes.personal)).toBe(0);
  });

  it("cuenta cuántos datos faltan por confirmar", () => {
    const pending = pendingConfirmations(
      [
        sub({ id: "a", amount: null, amount_status: "unknown", next_charge_date: null, date_status: "unknown" }),
        sub({ id: "b", amount: 8.1, amount_status: "communicated", tax: "unknown" }),
        sub({ id: "c", status: "cancelled", amount: null, amount_status: "unknown", next_charge_date: null, date_status: "unknown" }),
      ],
      [{ renews_status: "unknown" }, { renews_status: "communicated" }],
    );
    expect(pending.amounts).toBe(1);
    expect(pending.estimatedAmounts).toBe(1);
    expect(pending.dates).toBe(1);
    expect(pending.domainDates).toBe(1);
  });
});

describe("socios y gastos compartidos", () => {
  const partner = (id: string, name: string): Partner => ({ ...row, id, name, email: null, phone: null, company: null, notes: null, source: null });
  const link = (partnerId: string, share: number | null): ProjectPartner => ({
    ...row,
    id: `l-${partnerId}`,
    project_id: "proj",
    partner_id: partnerId,
    share,
    role: null,
    notes: null,
  });

  const data = {
    partners: [partner("ana", "Ana"), partner("luis", "Luis")],
    projectPartners: [link("ana", 40), link("luis", 20)],
    chargeShares: [],
    charges: [
      // Lo pagó Ana: a ella le toca el 40 %, a Luis el 20 % y a ti el 40 %.
      charge({ id: "c1", amount: 100, project_id: "proj", shared: true, paid_by_partner_id: "ana", operation_date: "2026-10-01" }),
    ],
  };

  it("reparte según lo acordado y deja tu parte", () => {
    const split = splitOf(data.charges[0], data);
    expect(split.undecided).toBe(false);
    expect(split.shares).toEqual([
      { partnerId: null, amount: 40, settled: true },
      { partnerId: "ana", amount: 40, settled: false },
      { partnerId: "luis", amount: 20, settled: false },
    ]);
  });

  it("dice quién debe a quién", () => {
    const balances = partnerBalances(data);
    const ana = balances.find((b) => b.partner.id === "ana")!;
    const luis = balances.find((b) => b.partner.id === "luis")!;
    // Ana puso 100 y le tocaban 40: le debes 60 entre Luis y tú.
    expect(ana.paid).toBe(100);
    expect(ana.owes).toBe(40);
    expect(ana.net).toBe(60);
    expect(luis.net).toBe(-20);
  });

  it("no reparte a ciegas cuando no hay nada acordado", () => {
    const sin = { ...data, projectPartners: [link("ana", null)] };
    const split = splitOf(sin.charges[0], sin);
    expect(split.undecided).toBe(true);
    expect(split.shares).toEqual([{ partnerId: null, amount: 100, settled: true }]);
  });

  it("un gasto sin reparto es entero de quien lo pagó", () => {
    const solo = {
      ...data,
      charges: [charge({ id: "c2", amount: 50, project_id: "proj", shared: false, paid_by_partner_id: "luis", operation_date: "2026-10-02" })],
    };
    const split = splitOf(solo.charges[0], solo);
    expect(split.undecided).toBe(false);
    expect(split.shares).toEqual([{ partnerId: "luis", amount: 50, settled: true }]);
    // Puso 50 y le tocaban 50: nadie debe nada.
    expect(partnerBalances(solo).find((b) => b.partner.id === "luis")!.net).toBe(0);
  });

  it("lista los gastos del proyecto, compartidos y de uno solo", () => {
    const both = {
      ...data,
      charges: [
        ...data.charges,
        charge({ id: "c2", amount: 50, project_id: "proj", shared: false, paid_by_partner_id: "luis", operation_date: "2026-10-02" }),
        charge({ id: "c3", amount: 30, project_id: "proj", shared: false, paid_by_partner_id: null, operation_date: "2026-10-03" }),
        charge({ id: "c4", amount: 999, project_id: "otro", shared: false, paid_by_partner_id: null, operation_date: "2026-10-04" }),
      ],
    };
    const expenses = projectCharges(both, "proj");
    expect(expenses.map((e) => e.charge.id)).toEqual(["c3", "c2", "c1"]);
    expect(expenses.map((e) => e.shared)).toEqual([false, false, true]);
    expect(projectPaidBy(expenses)).toEqual([
      { partnerId: "ana", amount: 100 },
      { partnerId: "luis", amount: 50 },
      { partnerId: null, amount: 30 },
    ]);
  });

  it("un intento fallido no mueve ningún saldo", () => {
    const failed = { ...data, charges: [{ ...data.charges[0], status: "failed" as const }] };
    expect(partnerBalances(failed).every((b) => b.net === 0)).toBe(true);
  });
});
