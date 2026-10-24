import { BookOpen, ExternalLink, GraduationCap, MapPin, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DoneToggle } from "@/components/panel/Actions";
import { EmptyState, HeaderLink, PageHeader, Pill, Row, RowList } from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { addDays, countdown, diffDays, endOfMonth, shortTime, startOfWeek } from "@/lib/life/dates";
import { editHref, newHref } from "@/lib/life/links";
import { type CourseItem, courseItemKindLabel } from "@/lib/life/model";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Universidad" };

/** ¿Qué tengo que entregar? */
export default async function UniversityPage() {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();
  const courseName = new Map(data.courses.map((c) => [c.id, c.name]));

  const open = data.courseItems
    .filter((i) => i.status !== "done")
    .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));
  const weekEnd = addDays(startOfWeek(today), 6);
  const monthEnd = endOfMonth(today);

  const groups = [
    { key: "late", label: "Atrasadas", items: open.filter((i) => i.due_date && i.due_date < today) },
    { key: "week", label: "Esta semana", items: open.filter((i) => i.due_date && i.due_date >= today && i.due_date <= weekEnd) },
    { key: "month", label: "Este mes", items: open.filter((i) => i.due_date && i.due_date > weekEnd && i.due_date <= monthEnd) },
    { key: "later", label: "Próximas entregas", items: open.filter((i) => i.due_date && i.due_date > monthEnd) },
    { key: "nodate", label: "Sin fecha", items: open.filter((i) => !i.due_date) },
  ].filter((g) => g.items.length);

  const done = data.courseItems.filter((i) => i.status === "done").slice(-8).reverse();
  const pendingBy = (courseId: string) => open.filter((i) => i.course_id === courseId).length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Universidad"
        question="¿Qué tengo que entregar?"
        actions={
          <>
            <HeaderLink icon={GraduationCap} href={newHref("course", panelRoutes.university)}>
              Asignatura
            </HeaderLink>
            {data.courses.length ? (
              <HeaderLink primary icon={Plus} href={newHref("courseItem", panelRoutes.university)}>
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
            <HeaderLink primary icon={Plus} href={newHref("course", panelRoutes.university)}>
              Primera asignatura
            </HeaderLink>
          }
        >
          Con las asignaturas dentro, cada entrega y cada examen aparecerán en el inicio con la cuenta atrás.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            {groups.length ? (
              groups.map((group) => (
                <section key={group.key} aria-labelledby={`g-${group.key}`} className="flex flex-col gap-2">
                  <h2 id={`g-${group.key}`} className="px-1 text-sm font-semibold text-fg-subtle">
                    {group.label}
                  </h2>
                  <RowList>
                    {group.items.map((item) => (
                      <ItemRow key={item.id} item={item} course={courseName.get(item.course_id)} today={today} />
                    ))}
                  </RowList>
                </section>
              ))
            ) : (
              <EmptyState icon={BookOpen} title="Nada pendiente">
                Sin entregas ni exámenes por delante.
              </EmptyState>
            )}

            {done.length ? (
              <section aria-label="Entregadas" className="flex flex-col gap-2">
                <h2 className="px-1 text-sm font-semibold text-fg-subtle">Entregadas</h2>
                <RowList>
                  {done.map((item) => (
                    <ItemRow key={item.id} item={item} course={courseName.get(item.course_id)} today={today} />
                  ))}
                </RowList>
              </section>
            ) : null}
          </div>

          <section aria-labelledby="courses-title" className="flex flex-col gap-3">
            <h2 id="courses-title" className="px-1 text-lg font-semibold tracking-[-0.015em]">
              Asignaturas
            </h2>
            <ul className="grid gap-3">
              {data.courses.map((course) => {
                const pending = pendingBy(course.id);
                return (
                  <li key={course.id} className="flex flex-col gap-3 rounded-2xl bg-surface p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={editHref("course", course.id, panelRoutes.university)}
                        scroll={false}
                        className="text-[0.9375rem] font-semibold text-fg hover:underline"
                      >
                        {course.name}
                      </Link>
                      {pending ? <Pill tone="accent">{pending} pendiente{pending === 1 ? "" : "s"}</Pill> : null}
                    </div>
                    <dl className="flex flex-col gap-1 text-sm text-fg-muted">
                      {course.schedule ? (
                        <div className="flex gap-2">
                          <dt className="sr-only">Horario</dt>
                          <dd>{course.schedule}</dd>
                        </div>
                      ) : null}
                      {course.teacher || course.room ? (
                        <div className="flex items-center gap-1.5">
                          <dt className="sr-only">Profesor y aula</dt>
                          <dd className="flex items-center gap-1.5">
                            {course.room ? <MapPin className="size-3.5" aria-hidden /> : null}
                            {[course.room, course.teacher].filter(Boolean).join(" · ")}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={newHref("courseItem", panelRoutes.university, { course_id: course.id })}
                        scroll={false}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-fill px-3 text-sm font-medium text-fg hover:bg-fill-strong"
                      >
                        <Plus className="size-3.5" strokeWidth={2.5} aria-hidden />
                        Entrega
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
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, course, today }: { item: CourseItem; course?: string; today: string }) {
  const days = item.due_date ? diffDays(today, item.due_date) : null;
  const done = item.status === "done";
  return (
    <Row
      href={editHref("courseItem", item.id, panelRoutes.university)}
      leading={<DoneToggle id={item.id} done={done} label={item.title} kind="courseItem" />}
      title={item.title}
      muted={done}
      detail={[courseItemKindLabel[item.kind], course, shortTime(item.due_time)].filter(Boolean).join(" · ")}
      trailing={
        item.due_date && !done ? (
          <Pill tone={days! < 0 ? "critical" : days! <= 2 ? "caution" : item.kind === "exam" ? "accent" : "neutral"}>
            {countdown(item.due_date, today)}
          </Pill>
        ) : item.grade !== null && done ? (
          <span className="tnum text-sm font-semibold text-fg">{item.grade}</span>
        ) : undefined
      }
    />
  );
}
