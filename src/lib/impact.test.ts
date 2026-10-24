import { describe, expect, it } from "vitest";

import { initialValues, scenarioByKey, scenarios, WORKING_WEEKS } from "./impact";

/**
 * La aritmética que se enseña en la web.
 *
 * Un número equivocado aquí es una promesa falsa delante de un empresario,
 * así que cada escenario se comprueba con el caso del propio copy.
 */

const run = (key: string, values: Record<string, number>) => {
  const scenario = scenarioByKey(key)!;
  return scenario.compute({ ...initialValues(scenario), ...values });
};

describe("escenarios de impacto", () => {
  it("todos tienen clave única, campos y pregunta", () => {
    const keys = scenarios.map((scenario) => scenario.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const scenario of scenarios) {
      expect(scenario.inputs.length).toBeGreaterThan(1);
      expect(scenario.question.length).toBeGreaterThan(15);
      for (const input of scenario.inputs) {
        expect(input.initial).toBeGreaterThanOrEqual(input.min);
        expect(input.initial).toBeLessThanOrEqual(input.max);
      }
    }
  });

  it("conversión: el ejemplo de la home sale a 1.500 € al mes", () => {
    const result = run("conversion", { leads: 100, current: 20, target: 25, ticket: 300, margin: 40 });
    expect(result.headline.value).toBe(1500);
    expect(result.headline.kind).toBe("revenue");
    // La facturación no se confunde con el beneficio.
    expect(result.lines.find((line) => line.kind === "profit")?.value).toBe(7200);
    expect(result.warning).toBeNull();
  });

  it("conversión: un objetivo por debajo del actual avisa en vez de dar una cifra buena", () => {
    const result = run("conversion", { current: 30, target: 20 });
    expect(result.warning).toBeTruthy();
    expect(result.headline.value).toBeLessThan(0);
  });

  it("horas: 12 min × 25 veces = 230 h al año y el ahorro es ahorro, no facturación", () => {
    const result = run("hours", { minutes: 12, times: 25, people: 1, rate: 22, share: 100 });
    const hoursYear = (12 * 25 * 1) / 60 * WORKING_WEEKS;
    expect(hoursYear).toBe(230);
    expect(result.headline.value).toBe(230);
    const saving = result.lines.find((line) => line.kind === "saving");
    expect(saving?.value).toBe(230 * 22);
  });

  it("horas: automatizar la mitad recupera la mitad", () => {
    const full = run("hours", { share: 100 }).headline.value;
    const half = run("hours", { share: 50 }).headline.value;
    expect(half).toBeCloseTo(full / 2, 6);
  });

  it("recuperación: 40 presupuestos al 10 % y 600 € dan 2.400 €", () => {
    const result = run("recovery", { open: 40, rate: 10, ticket: 600, margin: 40 });
    expect(result.headline.value).toBe(2400);
    expect(result.workings).toContain("una sola vez");
  });

  it("recurrencia: una compra más al año por cliente", () => {
    const result = run("repeat", { customers: 200, current: 2, target: 3, ticket: 120, margin: 40 });
    expect(result.headline.value).toBe(24000);
    expect(result.lines.find((line) => line.label.includes("Por cliente"))?.value).toBe(120);
  });

  it("costes: un ahorro no lleva margen descontado", () => {
    const result = run("costs", { monthly: 1200, share: 12 });
    expect(result.headline.value).toBe(1728);
    expect(result.headline.kind).toBe("saving");
    expect(result.lines.every((line) => line.kind !== "revenue")).toBe(true);
  });

  it("retorno: separa el neto mensual, el año uno y el porcentaje", () => {
    const result = run("roi", { invest: 3000, recurring: 60, benefit: 600 });
    expect(result.headline.value).toBeCloseTo(3000 / 540, 2);
    expect(result.lines[0].value).toBe(540);
    expect(result.lines[1].value).toBe(540 * 12 - 3000);
    expect(result.lines[2].value).toBeCloseTo(((540 * 12 - 3000) / 3000) * 100, 2);
  });

  it("retorno: si no queda nada neto, lo dice en vez de dividir por cero", () => {
    const result = run("roi", { invest: 3000, recurring: 600, benefit: 400 });
    expect(result.warning).toBeTruthy();
    expect(Number.isFinite(result.headline.value)).toBe(true);
    expect(result.workings).toContain("no se recupera");
  });

  it("cada resultado explica su cuenta", () => {
    for (const scenario of scenarios) {
      const result = scenario.compute(initialValues(scenario));
      expect(result.workings.length).toBeGreaterThan(40);
      expect(result.headline.label.length).toBeGreaterThan(5);
    }
  });
});
