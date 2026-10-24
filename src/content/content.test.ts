import { describe, expect, it } from "vitest";

import { areas, signals } from "./areas";
import { cases, publishedCases } from "./cases";
import { generalFaq } from "./faq";
import { methodName, methodPhases } from "./method";
import { sectors } from "./sectors";
import { publishedSolutions, solutions } from "./solutions";

/**
 * Content invariants.
 *
 * These are not unit tests of behaviour, they are guardrails on the two things
 * most likely to go wrong as content grows: broken links between entries, and
 * the credibility rule about invented figures. Both are cheap to break by hand
 * and expensive to notice in production.
 */

describe("solutions", () => {
  it("has unique slugs", () => {
    const slugs = solutions.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only links to solutions that exist and are published", () => {
    const published = new Set(publishedSolutions.map((entry) => entry.slug));
    for (const solution of publishedSolutions) {
      for (const related of solution.related) {
        expect(published, `${solution.slug} -> ${related}`).toContain(related);
      }
    }
  });

  it("never links to itself", () => {
    for (const solution of publishedSolutions) {
      expect(solution.related).not.toContain(solution.slug);
    }
  });

  it("has SEO metadata within sensible limits", () => {
    for (const solution of publishedSolutions) {
      expect(solution.seo.title.length).toBeGreaterThan(5);
      expect(solution.seo.description.length).toBeLessThanOrEqual(180);
      expect(solution.seo.description.length).toBeGreaterThan(50);
    }
  });

  it("gives every process both sides, and makes the automated side shorter", () => {
    for (const solution of publishedSolutions) {
      expect(solution.process.before.steps.length).toBeGreaterThan(0);
      expect(solution.process.after.steps.length).toBeGreaterThan(0);
      expect(solution.process.after.steps.length).toBeLessThanOrEqual(
        solution.process.before.steps.length,
      );
    }
  });

  it("uses unique step ids within a process", () => {
    for (const solution of publishedSolutions) {
      const ids = [
        ...solution.process.before.steps,
        ...solution.process.after.steps,
      ].map((step) => step.id);
      expect(new Set(ids).size, solution.slug).toBe(ids.length);
    }
  });
});

describe("cases", () => {
  it("has unique slugs", () => {
    const slugs = cases.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("requires a source for every measured figure", () => {
    // The credibility rule, enforced. A figure presented as measured without
    // saying how it was measured is exactly what this site must never publish.
    for (const entry of publishedCases) {
      for (const metric of [entry.headline, ...entry.results]) {
        if (metric.provenance === "measured") {
          expect(metric.source, `${entry.slug}: ${metric.label}`).toBeTruthy();
        }
      }
    }
  });

  it("shows the arithmetic behind every demonstration", () => {
    for (const entry of publishedCases) {
      if (entry.kind === "demonstration") {
        expect(entry.workings, entry.slug).toBeTruthy();
      }
    }
  });

  it("uses unique step ids within a process", () => {
    for (const entry of publishedCases) {
      const ids = [...entry.process.before.steps, ...entry.process.after.steps].map(
        (step) => step.id,
      );
      expect(new Set(ids).size, entry.slug).toBe(ids.length);
    }
  });
});

describe("method", () => {
  it("has five phases numbered in order", () => {
    expect(methodPhases).toHaveLength(5);
    expect(methodPhases.map((phase) => phase.number)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
    ]);
  });

  it("gives every phase a deliverable", () => {
    for (const phase of methodPhases) {
      expect(phase.deliverable.length).toBeGreaterThan(10);
      expect(phase.detail.length).toBeGreaterThan(0);
    }
  });
});

describe("faq", () => {
  it("has unique ids", () => {
    const ids = generalFaq.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("answers every question with more than a sentence fragment", () => {
    for (const item of generalFaq) {
      expect(item.answer.length, item.id).toBeGreaterThan(60);
    }
  });
});

describe("áreas", () => {
  it("tiene tres, con número y slug únicos", () => {
    expect(areas).toHaveLength(3);
    expect(new Set(areas.map((area) => area.slug)).size).toBe(3);
    expect(new Set(areas.map((area) => area.number)).size).toBe(3);
  });

  it("cada área explica problemas, palancas y qué se mide", () => {
    for (const area of areas) {
      expect(area.problems.length).toBeGreaterThan(2);
      expect(area.levers.length).toBeGreaterThan(2);
      expect(area.signals.length).toBeGreaterThan(2);
      expect(area.faq.length).toBeGreaterThan(0);
    }
  });

  it("tiene metadatos dentro de los límites", () => {
    for (const area of areas) {
      expect(area.seo.title.length).toBeLessThanOrEqual(70);
      expect(area.seo.description.length).toBeGreaterThan(50);
      expect(area.seo.description.length).toBeLessThanOrEqual(180);
    }
  });

  it("las señales apuntan a un área que existe y lo dicen todo", () => {
    const slugs = new Set(areas.map((area) => area.slug));
    expect(new Set(signals.map((signal) => signal.id)).size).toBe(signals.length);
    for (const signal of signals) {
      expect(slugs, signal.id).toContain(signal.area);
      expect(signal.situation.length).toBeGreaterThan(20);
      expect(signal.cost.length).toBeGreaterThan(20);
      expect(signal.opportunity.length).toBeGreaterThan(10);
      expect(signal.fix.length).toBeGreaterThan(20);
    }
  });
});

describe("sectores", () => {
  it("tiene slugs únicos", () => {
    const slugs = sectors.map((sector) => sector.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("usa valores finitos y no negativos en la comparación", () => {
    for (const sector of sectors) {
      const values = [
        sector.example.compare?.now.value,
        sector.example.compare?.better.value,
      ];

      for (const value of values) {
        expect(Number.isFinite(value), sector.slug).toBe(true);
        if (typeof value === "number") {
          expect(value, sector.slug).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("incluye entre dos y tres cifras de apoyo", () => {
    for (const sector of sectors) {
      const count = sector.example.stats?.length;

      expect(typeof count, sector.slug).toBe("number");
      if (typeof count === "number") {
        expect(count, sector.slug).toBeGreaterThanOrEqual(2);
        expect(count, sector.slug).toBeLessThanOrEqual(3);
      }
    }
  });

  it("respalda cada cifra estructurada en la cuenta escrita", () => {
    const numbersIn = (text: string): number[] =>
      Array.from(text.matchAll(/\d+(?:\.\d{3})*(?:,\d+)?/g), ([value]) =>
        Number(value.replaceAll(".", "").replace(",", ".")),
      );

    for (const sector of sectors) {
      const compare = sector.example.compare;
      const figures = [
        ...(compare ? [compare.now, compare.better] : []),
        ...(sector.example.stats ?? []),
      ];
      const workingsNumbers = numbersIn(sector.example.workings);

      expect(
        figures.length,
        sector.slug + ": faltan cifras estructuradas",
      ).toBeGreaterThanOrEqual(4);
      for (const figure of figures) {
        expect(
          workingsNumbers,
          sector.slug + ": " + figure.label + " (" + figure.value + ")",
        ).toContain(figure.value);
      }
    }
  });

  it("cada sector trae problemas, oportunidades y un ejemplo con hipótesis", () => {
    for (const sector of sectors) {
      expect(sector.problems.length).toBeGreaterThan(2);
      expect(sector.opportunities.length).toBeGreaterThan(2);
      expect(sector.example.workings.length).toBeGreaterThan(80);
      // Un ejemplo numérico sin hipótesis a la vista es una cifra inventada.
      expect(sector.example.assumptions.length).toBeGreaterThan(0);
      expect(sector.faq.length).toBeGreaterThan(0);
    }
  });

  it("tiene metadatos dentro de los límites", () => {
    for (const sector of sectors) {
      expect(sector.seo.title.length).toBeLessThanOrEqual(80);
      expect(sector.seo.description.length).toBeGreaterThan(50);
      expect(sector.seo.description.length).toBeLessThanOrEqual(180);
    }
  });

  it("ningún identificador de pregunta se repite en todo el contenido", () => {
    const ids = [
      ...areas.flatMap((area) => area.faq.map((item) => item.id)),
      ...sectors.flatMap((sector) => sector.faq.map((item) => item.id)),
      ...generalFaq.map((item) => item.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("el método", () => {
  it("son cinco fases numeradas en orden", () => {
    expect(methodPhases.map((phase) => phase.number)).toEqual(["01", "02", "03", "04", "05"]);
  });

  it("cada fase dice qué recibe el cliente", () => {
    for (const phase of methodPhases) {
      expect(phase.deliverable.length).toBeGreaterThan(20);
      expect(phase.detail.length).toBeGreaterThan(1);
    }
  });

  it("no se atribuye un registro de marca que no existe", () => {
    expect(methodName).not.toContain("®");
    expect(methodName).toBe("Método VCO");
  });
});
