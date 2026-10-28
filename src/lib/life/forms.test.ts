import { describe, expect, it } from "vitest";

import { parseEntityForm } from "./entities";
import { addToTotal, emptyTotal, totalOf } from "./finance";
import { formatMoney, subscriptionTotals } from "./money";
import type { Subscription } from "./model";

/**
 * Guardar un registro desde el formulario.
 *
 * Esta regresión existe por un fallo real: una suscripción con importe no se
 * guardaba. El formulario traía «El importe es» en «Pendiente de confirmar»,
 * la validación cruzada exigía cambiarlo a mano y devolvía un error de campo,
 * así que al dar a guardar no pasaba nada y no se veía por qué.
 *
 * La base de datos sí obliga a que un importe vacío sea «unknown» y al revés
 * (CHECK `subscriptions_amount_known`). Lo que cambia es quién cede: ahora el
 * formulario alinea la pareja —si escribes una cifra, la cifra es tuya y queda
 * confirmada— en vez de negarse a guardar.
 */

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("parseEntityForm: suscripciones", () => {
  it("guarda una suscripción con importe sin tocar los desplegables", () => {
    const result = parseEntityForm("subscription", form({ name: "ChatGPT Plus", amount: "8" }));

    expect(result.ok).toBe(true);
    expect(result.values.amount).toBe(8);
    expect(result.values.amount_status).toBe("confirmed");
    expect(result.values.currency).toBe("EUR");
  });

  it("guarda importe y fecha de cobro juntos", () => {
    const result = parseEntityForm(
      "subscription",
      form({ name: "Spotify", amount: "6,49", next_charge_date: "2026-11-05" }),
    );

    expect(result.ok).toBe(true);
    expect(result.values.amount).toBe(6.49);
    expect(result.values.next_charge_date).toBe("2026-11-05");
    expect(result.values.date_status).toBe("confirmed");
  });

  it("sin importe, la confianza vuelve a «pendiente de confirmar», nunca a 0 €", () => {
    const result = parseEntityForm(
      "subscription",
      form({ name: "Resend", amount_status: "confirmed", date_status: "observed" }),
    );

    expect(result.ok).toBe(true);
    expect(result.values.amount).toBeNull();
    expect(result.values.amount_status).toBe("unknown");
    expect(result.values.next_charge_date).toBeNull();
    expect(result.values.date_status).toBe("unknown");
  });

  it("una frecuencia personalizada sigue exigiendo los días", () => {
    const result = parseEntityForm(
      "subscription",
      form({ name: "Algo", amount: "10", frequency: "custom" }),
    );

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.custom_days).toBeTruthy();
  });

  it("guarda un importe en dólares con su moneda", () => {
    const result = parseEntityForm(
      "subscription",
      form({ name: "Vercel Pro", amount: "20", currency: "USD" }),
    );

    expect(result.ok).toBe(true);
    expect(result.values.currency).toBe("USD");
  });

  it("un dominio sin fecha de renovación también se guarda", () => {
    const result = parseEntityForm("domain", form({ domain: "ejemplo.es" }));

    expect(result.ok).toBe(true);
    expect(result.values.renews_status).toBe("unknown");
  });
});

describe("parseEntityForm: cargos", () => {
  it("un cargo puntual acepta su moneda", () => {
    const result = parseEntityForm(
      "charge",
      form({ description: "Vercel", amount: "120,99", currency: "USD", operation_date: "2026-10-25" }),
    );

    expect(result.ok).toBe(true);
    expect(result.values.amount).toBe(120.99);
    expect(result.values.currency).toBe("USD");
  });
});

describe("monedas", () => {
  it("cada importe se escribe con su símbolo", () => {
    expect(formatMoney(8, { currency: "EUR" })).toContain("€");
    expect(formatMoney(120.99, { currency: "USD" })).toContain("$");
    expect(formatMoney(8)).toContain("€");
  });

  it("un importe en dólares no se suma a un total en euros: se cuenta aparte", () => {
    const total = totalOf([
      { amount: 21.78, confidence: "confirmed" },
      { amount: 120.99, confidence: "confirmed", currency: "USD" },
      { amount: null, confidence: "unknown" },
    ]);

    expect(total.confirmed).toBe(21.78);
    expect(total.foreign).toBe(1);
    expect(total.unknown).toBe(1);
  });

  it("sin moneda se asume euros, que es la moneda de la casa", () => {
    expect(addToTotal(emptyTotal, 10, "confirmed").confirmed).toBe(10);
    expect(addToTotal(emptyTotal, 10, "confirmed", "USD").confirmed).toBe(0);
  });

  it("una suscripción en dólares no entra en el coste mensual en euros", () => {
    const base = {
      id: "x",
      created_at: "",
      updated_at: "",
      company: null,
      category: "software",
      amount_status: "confirmed",
      amount_as_of: null,
      custom_days: null,
      date_status: "confirmed",
      tax: "unknown",
      status: "active",
      scope: "pending",
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
    } as unknown as Subscription;

    const totals = subscriptionTotals([
      { ...base, name: "Spotify", amount: 6.49, currency: "EUR", frequency: "monthly", next_charge_date: "2026-11-05" },
      { ...base, id: "y", name: "Vercel", amount: 20, currency: "USD", frequency: "monthly", next_charge_date: "2026-11-06" },
    ]);

    expect(totals.monthly).toBeCloseTo(6.49, 2);
    expect(totals.active).toBe(2);
    // El de dólares se cuenta como no comparable, no como 0 €.
    expect(totals.unknown).toBe(1);
  });
});
