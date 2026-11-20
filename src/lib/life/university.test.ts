import { describe, expect, it } from "vitest";

import { parseEntityForm } from "./entities";
import type { Course, Degree } from "./model";
import { currentTerm, degreeSummary, nextTerm, planByTerm, statusOf, termLabel } from "./university";

const row = { created_at: "", updated_at: "" };
let n = 0;
const course = (over: Partial<Course>): Course => ({
  ...row,
  id: `c${++n}`,
  name: `Asignatura ${n}`,
  teacher: null,
  schedule: null,
  room: null,
  url: null,
  notes: null,
  active: false,
  code: null,
  ects: 6,
  plan_year: 3,
  semester: "first",
  category: "core",
  status: "pending",
  academic_year: null,
  grade: null,
  to_confirm: null,
  ...over,
});

const degree = (over: Partial<Degree> = {}): Degree => ({
  ...row,
  id: "d1",
  name: "Grado",
  university: null,
  total_ects: 240,
  elective_ects: 36,
  passed_ects: null,
  passed_ects_as_of: null,
  url: null,
  notes: null,
  ...over,
});

describe("terms", () => {
  it("places September to January in the first semester", () => {
    expect(currentTerm("2026-11-20")).toEqual({ academicYear: "2026-2027", semester: "first" });
    expect(currentTerm("2027-01-25")).toEqual({ academicYear: "2026-2027", semester: "first" });
    expect(currentTerm("2026-09-01")).toEqual({ academicYear: "2026-2027", semester: "first" });
  });

  it("places February to August in the second, resits included", () => {
    expect(currentTerm("2027-02-01")).toEqual({ academicYear: "2026-2027", semester: "second" });
    expect(currentTerm("2027-07-15")).toEqual({ academicYear: "2026-2027", semester: "second" });
  });

  it("rolls the second semester into the next academic year", () => {
    expect(nextTerm({ academicYear: "2026-2027", semester: "first" })).toEqual({
      academicYear: "2026-2027",
      semester: "second",
    });
    expect(nextTerm({ academicYear: "2026-2027", semester: "second" })).toEqual({
      academicYear: "2027-2028",
      semester: "first",
    });
    expect(termLabel({ academicYear: "2026-2027", semester: "first" })).toBe("1.er cuatrimestre 2026-2027");
  });
});

describe("planByTerm", () => {
  const now = course({ status: "enrolled", academic_year: "2026-2027", semester: "first" });
  const next = course({ status: "planned", academic_year: "2026-2027", semester: "second", to_confirm: "Matrícula" });
  const later = course({ status: "pending", plan_year: 2, semester: "second" });
  const passed = course({ status: "passed", category: "elective", academic_year: "2025-2026" });
  const internship = course({ category: "internship", ects: 12, status: "planned", academic_year: "2026-2027", semester: "second" });
  const plan = planByTerm([later, next, internship, passed, now], "2026-11-20");

  it("splits now, next and later, leaving passed courses out of later", () => {
    expect(plan.now.courses).toEqual([now]);
    expect(plan.next.courses).toEqual([next]);
    expect(plan.later).toEqual([later]);
  });

  it("keeps the TFG and the internship apart from the semester subjects", () => {
    expect(plan.next.courses).not.toContain(internship);
    expect(plan.milestones).toEqual([internship]);
    expect(plan.next.credits).toEqual({ count: 1, ects: 6, withoutEcts: 0, toConfirm: 1 });
  });
});

describe("degreeSummary", () => {
  const courses = [
    course({ status: "passed", category: "elective", to_confirm: "Nombre y créditos" }),
    course({ status: "enrolled", category: "elective" }),
    course({ status: "pending" }),
    course({ status: "pending", ects: null }),
    course({ status: "planned", category: "internship", ects: 12 }),
  ];

  it("counts only passed as done and says what it could not add", () => {
    const summary = degreeSummary(courses, degree());
    expect(summary.passed.ects).toBe(6);
    expect(summary.passed.toConfirm).toBe(1);
    expect(summary.remaining).toEqual({ count: 4, ects: 24, withoutEcts: 1, toConfirm: 0 });
    expect(summary.electives).toMatchObject({
      required: 36,
      passed: { ects: 6 },
      inProgress: { ects: 6 },
      internship: { ects: 12 },
    });
  });

  it("never computes a share of the degree without the transcript", () => {
    expect(degreeSummary(courses, degree()).percent).toBeNull();
    expect(degreeSummary(courses, null).percent).toBeNull();
    expect(degreeSummary(courses, degree({ passed_ects: 120 })).percent).toBe(50);
  });

  it("reads rows written before the plan fields as before", () => {
    const old = { ...course({}), status: undefined, active: true };
    expect(statusOf(old)).toBe("enrolled");
  });
});

describe("course form", () => {
  const form = (values: Record<string, string>) => {
    const data = new FormData();
    for (const [k, v] of Object.entries(values)) data.set(k, v);
    return data;
  };

  it("drops a grade on a course that is not passed and keeps active in step", () => {
    const result = parseEntityForm("course", form({ name: "Finanzas", status: "enrolled", grade: "7" }));
    expect(result.ok).toBe(true);
    expect(result.values.grade).toBeNull();
    expect(result.values.active).toBe(true);
  });

  it("asks for the academic year as 2026-2027", () => {
    const result = parseEntityForm("course", form({ name: "Finanzas", academic_year: "26/27" }));
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.academic_year).toBe("Escríbelo como 2026-2027");
  });
});
