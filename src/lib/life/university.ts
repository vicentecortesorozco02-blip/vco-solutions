import type { Course, CourseCategory, CourseStatus, Degree, ISODate, Semester } from "./model";

/**
 * The degree as a plan: what is being taken now, what comes next, what is
 * left after that, and how many credits each of those adds up to.
 *
 * Two honesty rules, same as money:
 * - Only "passed" is done. Enrolled and planned are not progress.
 * - The share of the degree completed comes from the official transcript
 *   (`degree.passed_ects`), never from adding up the courses typed here:
 *   first-year courses passed years ago are usually not in the panel at all.
 */

export interface Term {
  /** "2026-2027" */
  academicYear: string;
  semester: Exclude<Semester, "annual">;
}

/**
 * The term a date falls in. The first semester runs from September to
 * January, exams included; the second from February to August, resits
 * included.
 */
export function currentTerm(today: ISODate): Term {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  if (month >= 9) return { academicYear: `${year}-${year + 1}`, semester: "first" };
  if (month === 1) return { academicYear: `${year - 1}-${year}`, semester: "first" };
  return { academicYear: `${year - 1}-${year}`, semester: "second" };
}

export function nextTerm(term: Term): Term {
  if (term.semester === "first") return { ...term, semester: "second" };
  const start = Number(term.academicYear.slice(0, 4)) + 1;
  return { academicYear: `${start}-${start + 1}`, semester: "first" };
}

export function termLabel(term: Term): string {
  return `${term.semester === "first" ? "1.er" : "2.º"} cuatrimestre ${term.academicYear}`;
}

/** Rows written before the plan fields existed read as before: "Este curso" is enrolled. */
export function statusOf(course: Course): CourseStatus {
  return course.status ?? (course.active ? "enrolled" : "pending");
}

export function categoryOf(course: Course): CourseCategory {
  return course.category ?? "core";
}

/** A subject is a course with classes; the TFG and the internship are not. */
export function isSubject(course: Course): boolean {
  const category = categoryOf(course);
  return category === "core" || category === "elective";
}

export function inTerm(course: Course, term: Term): boolean {
  return (
    course.academic_year === term.academicYear &&
    (course.semester === term.semester || course.semester === "annual")
  );
}

const semesterOrder: Record<Semester, number> = { first: 1, second: 2, annual: 3 };

/** Plan order: year of the plan, semester, code, name. Unknowns last. */
export function byPlanOrder(a: Course, b: Course): number {
  return (
    (a.plan_year ?? 99) - (b.plan_year ?? 99) ||
    (a.semester ? semesterOrder[a.semester] : 9) - (b.semester ? semesterOrder[b.semester] : 9) ||
    (a.code ?? "~").localeCompare(b.code ?? "~") ||
    a.name.localeCompare(b.name, "es")
  );
}

export interface CreditSum {
  count: number;
  /** Credits of the courses that have them. */
  ects: number;
  /** Courses with no credits typed: left out of `ects`, said out loud. */
  withoutEcts: number;
  /** Courses with something still to confirm (name, credits…). */
  toConfirm: number;
}

export function sumCredits(courses: readonly Course[]): CreditSum {
  return courses.reduce<CreditSum>(
    (sum, course) => ({
      count: sum.count + 1,
      ects: sum.ects + Number(course.ects ?? 0),
      withoutEcts: sum.withoutEcts + (course.ects === null || course.ects === undefined ? 1 : 0),
      toConfirm: sum.toConfirm + (course.to_confirm ? 1 : 0),
    }),
    { count: 0, ects: 0, withoutEcts: 0, toConfirm: 0 },
  );
}

export interface TermPlan {
  term: Term;
  courses: Course[];
  credits: CreditSum;
}

export interface DegreePlan {
  now: TermPlan;
  next: TermPlan;
  /** Subjects not passed and not placed in now or next. */
  later: Course[];
  /** TFG and internship, apart: they are not subjects of a semester. */
  milestones: Course[];
}

/** What am I taking now, what comes next, and what is left after that. */
export function planByTerm(courses: readonly Course[], today: ISODate): DegreePlan {
  const now = currentTerm(today);
  const next = nextTerm(now);
  const subjects = courses.filter(isSubject).sort(byPlanOrder);
  const inNow = subjects.filter((c) => inTerm(c, now));
  const inNext = subjects.filter((c) => inTerm(c, next) && !inNow.includes(c));
  const placed = new Set([...inNow, ...inNext]);
  return {
    now: { term: now, courses: inNow, credits: sumCredits(inNow) },
    next: { term: next, courses: inNext, credits: sumCredits(inNext) },
    later: subjects.filter((c) => !placed.has(c) && statusOf(c) !== "passed"),
    milestones: courses.filter((c) => !isSubject(c)).sort(byPlanOrder),
  };
}

export interface DegreeSummary {
  passed: CreditSum;
  enrolled: CreditSum;
  planned: CreditSum;
  pending: CreditSum;
  /** Everything not passed: enrolled + planned + pending. */
  remaining: CreditSum;
  /** Electives and internship, against the credits the degree asks for. */
  electives: {
    required: number | null;
    passed: CreditSum;
    inProgress: CreditSum;
    internship: CreditSum;
  };
  /** Only from the transcript. Null means "not computed", never 0 %. */
  percent: number | null;
}

export function degreeSummary(courses: readonly Course[], degree: Degree | null): DegreeSummary {
  const by = (status: CourseStatus) => courses.filter((c) => statusOf(c) === status);
  const electives = courses.filter((c) => categoryOf(c) === "elective");
  const percent =
    degree && degree.passed_ects !== null && degree.total_ects > 0
      ? Math.min(100, Math.round((Number(degree.passed_ects) / Number(degree.total_ects)) * 100))
      : null;
  return {
    passed: sumCredits(by("passed")),
    enrolled: sumCredits(by("enrolled")),
    planned: sumCredits(by("planned")),
    pending: sumCredits(by("pending")),
    remaining: sumCredits(courses.filter((c) => statusOf(c) !== "passed")),
    electives: {
      required: degree?.elective_ects ?? null,
      passed: sumCredits(electives.filter((c) => statusOf(c) === "passed")),
      inProgress: sumCredits(electives.filter((c) => statusOf(c) !== "passed")),
      internship: sumCredits(courses.filter((c) => categoryOf(c) === "internship" && statusOf(c) !== "passed")),
    },
    percent,
  };
}

/** "6 ECTS", "4,5 ECTS". */
export function formatEcts(value: number): string {
  return `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })} ECTS`;
}
