import {
  BookOpen,
  CalendarPlus,
  ExternalLink,
  GraduationCap,
  Pencil,
  Plus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DoneToggle } from "@/components/panel/Actions";
import { MonthCalendar } from "@/components/panel/MonthCalendar";
import {
  Card,
  CardTitle,
  EmptyState,
  HeaderLink,
  PageHeader,
  Pill,
  ProgressBar,
  Row,
  RowList,
  StatCard,
} from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { buildAgenda, type AgendaItem } from "@/lib/life/agenda";
import {
  addDays,
  countdown,
  diffDays,
  endOfMonth,
  formatWithYear,
  shortTime,
  startOfMonth,
  startOfWeek,
} from "@/lib/life/dates";
import { editHref, newHref } from "@/lib/life/links";
import {
  type Course,
  type CourseItem,
  type CourseStatus,
  courseCategoryLabel,
  courseItemKindLabel,
  courseStatusLabel,
  semesterLabel,
} from "@/lib/life/model";
import { loadDegree, loadLifeData, requirePanelSession } from "@/lib/life/server";
import {
  type CreditSum,
  type TermPlan,
  byPlanOrder,
  categoryOf,
  degreeSummary,
  formatEcts,
  planByTerm,
  statusOf,
  sumCredits,
  termLabel,
} from "@/lib/life/university";

export const metadata: Metadata = { title: "Universidad" };

const here = panelRoutes.university;

/** ¿Qué me queda para graduarme? */
export default async function UniversityPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { today } = await requirePanelSession();
  const [data, degree] = await Promise.all([loadLifeData(), loadDegree()]);
  const { mes } = await searchParams;
  const calendarMonth = mes && /^\d{4}-\d{2}$/.test(mes) ? `${mes}-01` : today;
  const monthItems = new Map<string, AgendaItem[]>();
  for (const item of buildAgenda(data, startOfMonth(calendarMonth), endOfMonth(calendarMonth))) {
    const university = item.kind === "course" || (item.kind === "event" && item.category === "university");
    if (!university) continue;
    monthItems.set(item.date, [...(monthItems.get(item.date) ?? []), item]);
  }
  const courseName = new Map(data.courses.map((c) => [c.id, c.name]));

  const plan = planByTerm(data.courses, today);
  const summary = degreeSummary(data.courses, degree);

  const open = data.courseItems
    .filter((i) => i.status !== "done")
    .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));
  const weekEnd = addDays(startOfWeek(today), 6);
  const monthEnd = endOfMonth(today);
  const groups = [
    { key: "late", label: "Atrasadas", items: open.filter((i) => i.due_date && i.due_date < today) },
    {
      key: "week",
      label: "Esta semana",
      items: open.filter((i) => i.due_date && i.due_date >= today && i.due_date <= weekEnd),
    },
    {
      key: "month",
      label: "Este mes",
      items: open.filter((i) => i.due_date && i.due_date > weekEnd && i.due_date <= monthEnd),
    },
    { key: "later", label: "Más adelante", items: open.filter((i) => i.due_date && i.due_date > monthEnd) },
    { key: "nodate", label: "Sin fecha", items: open.filter((i) => !i.due_date) },
  ].filter((g) => g.items.length);
  const done = data.courseItems
    .filter((i) => i.status === "done")
    .slice(-8)
    .reverse();

  // Every subject, grouped by where it sits in the plan.
  const subjects = data.courses.filter((c) => categoryOf(c) === "core" || categoryOf(c) === "elective");
  const byYear = [1, 2, 3, 4, 5, 6]
    .map((year) => ({
      key: `y${year}`,
      label: `${year}.º curso`,
      courses: subjects.filter((c) => categoryOf(c) === "core" && c.plan_year === year),
    }))
    .concat([
      { key: "elective", label: "Optativas", courses: subjects.filter((c) => categoryOf(c) === "elective") },
      {
        key: "none",
        label: "Sin curso del plan",
        courses: subjects.filter((c) => categoryOf(c) === "core" && !c.plan_year),
      },
    ])
    .map((g) => ({ ...g, courses: [...g.courses].sort(byPlanOrder) }))
    .filter((g) => g.courses.length);

  const itemsOf = (courseId: string) =>
    data.courseItems
      .filter((i) => i.course_id === courseId)
      .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Universidad"
        question="¿Qué me queda para graduarme?"
        actions={
          <>
            <HeaderLink icon={GraduationCap} href={newHref("course", here)}>
              Asignatura
            </HeaderLink>
            <HeaderLink icon={CalendarPlus} href={newHref("event", here, { category: "university" })}>
              Fecha
            </HeaderLink>
            {data.courses.length ? (
              <HeaderLink primary icon={Plus} href={newHref("courseItem", here)}>
                Nueva entrega
              </HeaderLink>
            ) : null}
          </>
        }
      />

      {data.courses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Añade tus asignaturas"
          action={
            <HeaderLink primary icon={Plus} href={newHref("course", here)}>
              Primera asignatura
            </HeaderLink>
          }
        >
          Con las asignaturas dentro verás qué cursas ahora, qué viene después y
          cuántos créditos te quedan.
        </EmptyState>
      ) : (
        <>
          {/* 1. The degree in four figures. */}
          <section aria-labelledby="degree-title" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3 px-1">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 id="degree-title" className="text-lg font-semibold tracking-[-0.015em] text-fg">
                  {degree?.name ?? "Tu grado"}
                </h2>
                {degree?.university ? <p className="text-sm text-fg-muted">{degree.university}</p> : null}
              </div>
              <Link
                href={degree ? editHref("degree", degree.id, here) : newHref("degree", here)}
                scroll={false}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-fill px-3 text-sm font-medium text-fg hover:bg-fill-strong"
              >
                <Pencil className="size-3.5" strokeWidth={2} aria-hidden />
                {degree ? "Datos del grado" : "Añadir el grado"}
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Cursando ahora"
                value={ectsValue(plan.now.credits)}
                detail={`${countLabel(plan.now.credits.count)} · ${termLabel(plan.now.term)}`}
              />
              <StatCard
                label="Aprobado en el panel"
                value={ectsValue(summary.passed)}
                detail={withConfirm(countLabel(summary.passed.count, "aprobada"), summary.passed)}
              />
              <StatCard
                label="Te queda"
                value={ectsValue(summary.remaining)}
                detail={withConfirm(
                  `${countLabel(summary.remaining.count)}, TFG y prácticas incluidos`,
                  summary.remaining,
                )}
              />
              <StatCard
                label="Optatividad"
                value={
                  summary.electives.required !== null
                    ? `${num(summary.electives.passed.ects)} de ${num(summary.electives.required)}`
                    : ectsValue(summary.electives.passed)
                }
                detail={[
                  "ECTS aprobados",
                  summary.electives.inProgress.count ? `${num(summary.electives.inProgress.ects)} en marcha` : null,
                  summary.electives.internship.count ? `${num(summary.electives.internship.ects)} en prácticas` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            </div>

            <Card className="flex flex-col gap-3">
              {summary.percent !== null && degree ? (
                <>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[0.9375rem] font-semibold text-fg">
                      <span className="tnum">{summary.percent} %</span> del grado superado
                    </span>
                    <span className="text-sm text-fg-muted">
                      {num(Number(degree.passed_ects))} de {formatEcts(Number(degree.total_ects))} según el expediente
                      {degree.passed_ects_as_of ? ` del ${formatWithYear(degree.passed_ects_as_of)}` : ""}
                    </span>
                  </div>
                  <ProgressBar value={summary.percent} label="Créditos superados según el expediente" />
                </>
              ) : (
                <p className="text-sm text-fg-muted">
                  <span className="font-semibold text-fg">Porcentaje sin calcular.</span> Sale de los créditos
                  superados que figuran en tu expediente oficial, no de lo apuntado aquí: añádelos en{" "}
                  <Link
                    href={degree ? editHref("degree", degree.id, here) : newHref("degree", here)}
                    scroll={false}
                    className="font-medium text-accent-text underline underline-offset-2"
                  >
                    datos del grado
                  </Link>
                  .
                </p>
              )}
            </Card>
          </section>

          {/* 2. Now, next, after. */}
          <section aria-labelledby="plan-title" className="flex flex-col gap-4">
            <h2 id="plan-title" className="px-1 text-lg font-semibold tracking-[-0.015em] text-fg">
              Plan por cuatrimestres
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
              <TermColumn title="Ahora" plan={plan.now} />
              <TermColumn title="Siguiente" plan={plan.next} />
              <section aria-labelledby="term-later" className="flex flex-col gap-2">
                <TermHeading id="term-later" title="Después" subtitle="Sin cuatrimestre asignado" credits={sumCredits(plan.later)} />
                {plan.later.length ? (
                  <RowList>
                    {plan.later.map((c) => (
                      <CourseRow key={c.id} course={c} showWhen />
                    ))}
                  </RowList>
                ) : (
                  <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
                    Nada más pendiente fuera de estos dos cuatrimestres.
                  </p>
                )}
              </section>
            </div>
          </section>

          {/* 3. Deadlines, exams and the month. */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <section aria-labelledby="work-title" className="flex flex-col gap-4">
              <h2 id="work-title" className="px-1 text-lg font-semibold tracking-[-0.015em] text-fg">
                Entregas, exámenes y trámites
              </h2>
              {groups.length ? (
                groups.map((group) => (
                  <section key={group.key} aria-labelledby={`g-${group.key}`} className="flex flex-col gap-2">
                    <h3 id={`g-${group.key}`} className="px-1 text-sm font-semibold text-fg-subtle">
                      {group.label}
                    </h3>
                    <RowList>
                      {group.items.map((item) => (
                        <ItemRow key={item.id} item={item} course={courseName.get(item.course_id)} today={today} />
                      ))}
                    </RowList>
                  </section>
                ))
              ) : (
                <EmptyState icon={BookOpen} title="Nada pendiente">
                  Sin entregas, exámenes ni trámites apuntados. Las fechas de examen se añaden con «Nueva entrega»
                  cuando sean oficiales.
                </EmptyState>
              )}

              {done.length ? (
                <section aria-labelledby="g-done" className="flex flex-col gap-2">
                  <h3 id="g-done" className="px-1 text-sm font-semibold text-fg-subtle">
                    Hechas
                  </h3>
                  <RowList>
                    {done.map((item) => (
                      <ItemRow key={item.id} item={item} course={courseName.get(item.course_id)} today={today} />
                    ))}
                  </RowList>
                </section>
              ) : null}
            </section>

            <MonthCalendar
              month={calendarMonth}
              today={today}
              itemsFor={(date) => monthItems.get(date) ?? []}
              basePath={here}
              mode="work"
            />
          </div>

          {/* 4. TFG and internship. */}
          {plan.milestones.length ? (
            <section aria-labelledby="milestones-title" className="flex flex-col gap-4">
              <h2 id="milestones-title" className="px-1 text-lg font-semibold tracking-[-0.015em] text-fg">
                TFG y prácticas
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {plan.milestones.map((course) => (
                  <MilestoneCard key={course.id} course={course} items={itemsOf(course.id)} today={today} />
                ))}
              </div>
            </section>
          ) : null}

          {/* 5. The whole plan, year by year. */}
          <section aria-labelledby="years-title" className="flex flex-col gap-4">
            <h2 id="years-title" className="px-1 text-lg font-semibold tracking-[-0.015em] text-fg">
              Asignaturas por curso
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {byYear.map((group) => {
                const credits = sumCredits(group.courses);
                const passed = group.courses.filter((c) => statusOf(c) === "passed").length;
                return (
                  <section key={group.key} aria-labelledby={`y-${group.key}`} className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-3 px-1">
                      <h3 id={`y-${group.key}`} className="text-sm font-semibold text-fg-subtle">
                        {group.label}
                      </h3>
                      <span className="tnum text-sm text-fg-muted">
                        {passed} de {group.courses.length} aprobadas · {ectsValue(credits)}
                      </span>
                    </div>
                    <RowList>
                      {group.courses.map((c) => (
                        <CourseRow key={c.id} course={c} showWhen />
                      ))}
                    </RowList>
                  </section>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

const num = (value: number) => value.toLocaleString("es-ES", { maximumFractionDigits: 1 });

function countLabel(count: number, word = "asignatura"): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** Credits, or a word when none of the courses has them. Never a made-up 0. */
function ectsValue(credits: CreditSum): string {
  if (credits.count > 0 && credits.withoutEcts === credits.count) return "—";
  return formatEcts(credits.ects);
}

function withConfirm(text: string, credits: CreditSum): string {
  return [
    text,
    credits.toConfirm ? `${credits.toConfirm} por confirmar` : null,
    credits.withoutEcts ? `${credits.withoutEcts} sin créditos` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

const statusTone: Record<CourseStatus, "neutral" | "accent" | "positive" | "caution"> = {
  pending: "neutral",
  planned: "neutral",
  enrolled: "accent",
  passed: "positive",
};

function StatusPills({ course }: { course: Course }) {
  const status = statusOf(course);
  return (
    <>
      {course.to_confirm ? <Pill tone="caution">Por confirmar</Pill> : null}
      {status === "passed" && course.grade !== null && course.grade !== undefined ? (
        <span className="tnum text-sm font-semibold text-fg">{num(Number(course.grade))}</span>
      ) : null}
      <Pill tone={statusTone[status]}>{courseStatusLabel[status]}</Pill>
    </>
  );
}

function TermHeading({
  id,
  title,
  subtitle,
  credits,
}: {
  id: string;
  title: string;
  subtitle: string;
  credits: CreditSum;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-1">
      <div className="flex min-w-0 flex-col">
        <h3 id={id} className="text-[0.9375rem] font-semibold text-fg">
          {title}
        </h3>
        <span className="text-sm text-fg-muted">{subtitle}</span>
      </div>
      <span className="tnum shrink-0 text-sm text-fg-muted">
        {countLabel(credits.count)} · {ectsValue(credits)}
      </span>
    </div>
  );
}

function TermColumn({ title, plan }: { title: string; plan: TermPlan }) {
  const id = `term-${title.toLowerCase()}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <TermHeading id={id} title={title} subtitle={termLabel(plan.term)} credits={plan.credits} />
      {plan.courses.length ? (
        <RowList>
          {plan.courses.map((c) => (
            <CourseRow key={c.id} course={c} />
          ))}
        </RowList>
      ) : (
        <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
          Ninguna asignatura asignada a este cuatrimestre.
        </p>
      )}
    </section>
  );
}

function CourseRow({ course, showWhen = false }: { course: Course; showWhen?: boolean }) {
  const detail = [
    course.code,
    course.ects ? formatEcts(Number(course.ects)) : null,
    showWhen && course.plan_year ? `${course.plan_year}.º` : null,
    showWhen && course.semester ? semesterLabel[course.semester] : null,
    showWhen && course.academic_year && statusOf(course) !== "pending" ? course.academic_year : null,
    !showWhen ? course.room || course.schedule : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Row
      href={editHref("course", course.id, here)}
      title={course.name}
      detail={detail || undefined}
      trailing={<StatusPills course={course} />}
    />
  );
}

function MilestoneCard({ course, items, today }: { course: Course; items: CourseItem[]; today: string }) {
  const status = statusOf(course);
  const when = [
    course.academic_year,
    course.semester ? semesterLabel[course.semester] : null,
    course.plan_year ? `${course.plan_year}.º curso` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Card as="article" className="flex flex-col gap-4" aria-label={course.name}>
      <div className="flex flex-col gap-2">
        <CardTitle icon={GraduationCap}>{courseCategoryLabel[categoryOf(course)]}</CardTitle>
        <div className="-mt-2 flex flex-wrap items-start justify-between gap-3">
          <Link
            href={editHref("course", course.id, here)}
            scroll={false}
            className="text-base font-semibold text-fg hover:underline"
          >
            {course.name}
          </Link>
          <span className="flex flex-wrap items-center gap-2">
            <StatusPills course={course} />
          </span>
        </div>
        <p className="text-sm text-fg-muted">
          {[course.code, course.ects ? formatEcts(Number(course.ects)) : null, when || null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {course.to_confirm ? (
          <p className="text-sm text-fg-muted">
            <span className="font-medium text-fg">Por confirmar:</span> {course.to_confirm}
          </p>
        ) : null}
        {course.notes ? <p className="text-sm whitespace-pre-line text-fg-muted">{course.notes}</p> : null}
      </div>

      {items.length ? (
        <ul className="-mx-5 sm:-mx-6 [&>li:last-child>a]:border-b-0">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} course={undefined} today={today} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-fg-muted">
          {status === "passed" ? "Superado." : "Sin trámites ni fechas apuntados todavía."}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href={newHref("courseItem", here, { course_id: course.id, kind: "admin" })}
          scroll={false}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-fill px-3 text-sm font-medium text-fg hover:bg-fill-strong"
        >
          <Plus className="size-3.5" strokeWidth={2.5} aria-hidden />
          Trámite o fecha
        </Link>
        {course.url ? (
          <a
            href={course.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-fill px-3 text-sm font-medium text-fg hover:bg-fill-strong"
          >
            <ExternalLink className="size-3.5" strokeWidth={2} aria-hidden />
            Abrir
          </a>
        ) : null}
      </div>
    </Card>
  );
}

function ItemRow({ item, course, today }: { item: CourseItem; course?: string; today: string }) {
  const days = item.due_date ? diffDays(today, item.due_date) : null;
  const done = item.status === "done";
  return (
    <Row
      href={editHref("courseItem", item.id, here)}
      leading={<DoneToggle id={item.id} done={done} label={item.title} kind="courseItem" />}
      title={item.title}
      muted={done}
      detail={[courseItemKindLabel[item.kind], course, shortTime(item.due_time)].filter(Boolean).join(" · ")}
      trailing={
        item.due_date && !done ? (
          <Pill
            tone={days! < 0 ? "critical" : days! <= 2 ? "caution" : item.kind === "exam" ? "accent" : "neutral"}
          >
            {countdown(item.due_date, today)}
          </Pill>
        ) : item.grade !== null && done ? (
          <span className="tnum text-sm font-semibold text-fg">{item.grade}</span>
        ) : undefined
      }
    />
  );
}
