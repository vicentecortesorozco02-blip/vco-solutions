import { describe, expect, it } from "vitest";

import { cases, publishedCases } from "./cases";
import { generalFaq } from "./faq";
import { methodPhases } from "./method";
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
