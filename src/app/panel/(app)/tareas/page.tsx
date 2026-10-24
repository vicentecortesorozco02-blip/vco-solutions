import { CircleCheck, Plus } from "lucide-react";
import type { Metadata } from "next";

import { DoneToggle } from "@/components/panel/Actions";
import { TaskBoard, type BoardTask } from "@/components/panel/TaskBoard";
import { EmptyState, HeaderLink, PageHeader, Pill, Row, RowList, ViewTabs } from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { addDays, formatShort, relativeDay, shortTime } from "@/lib/life/dates";
import { newHref } from "@/lib/life/links";
import { type Task, priorityLabel, priorityWeight, taskStatusLabel } from "@/lib/life/model";
import { colorOf } from "@/lib/life/partners";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Tareas" };

const views = ["tablero", "hoy", "proximas", "atrasadas", "todas"] as const;
type View = (typeof views)[number];

/** ¿Qué tengo que hacer? */
export default async function TasksPage({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();
  const { vista } = await searchParams;
  // El tablero es lo primero que se ve: lo que hay, en qué va cada cosa.
  const view: View = (views as readonly string[]).includes(vista ?? "") ? (vista as View) : "tablero";

  const open = data.tasks.filter((t) => t.status !== "done");
  const byView: Record<View, Task[]> = {
    hoy: open.filter((t) => t.due_date === today || (t.status === "in_progress" && !t.due_date)),
    proximas: open.filter((t) => t.due_date && t.due_date > today),
    atrasadas: open.filter((t) => t.due_date && t.due_date < today),
    todas: open,
    // El tablero no filtra: enseña todas las columnas a la vez.
    tablero: data.tasks,
  };
  const list = [...byView[view]].sort(compareTasks);
  const done = view === "hoy" || view === "todas"
    ? data.tasks
        .filter((t) => t.status === "done" && (view === "todas" || t.due_date === today))
        .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""))
        .slice(0, 10)
    : [];

  const projectName = new Map(data.projects.map((p) => [p.id, p.name]));
  const courseName = new Map(data.courses.map((c) => [c.id, c.name]));
  const href = (key: View) => (key === "tablero" ? panelRoutes.tasks : `${panelRoutes.tasks}?vista=${key}`);
  const here = view === "tablero" ? panelRoutes.tasks : `${panelRoutes.tasks}?vista=${view}`;
  const editLink = (id: string) => `${here}${here.includes("?") ? "&" : "?"}editar=task:${id}`;

  const groups = view === "proximas" ? groupByDate(list) : [{ key: view, label: null, tasks: list }];

  // El tablero enseña todo, también lo terminado: de eso va un pipeline.
  const board: BoardTask[] = data.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    position: Number(task.position),
    dueLabel: task.due_date ? relativeDay(task.due_date, today) : null,
    overdue: Boolean(task.due_date && task.due_date < today && task.status !== "done"),
    priority: task.priority,
    projectName: task.project_id ? (projectName.get(task.project_id) ?? null) : null,
    projectColor: task.project_id ? colorOf(data.projects, task.project_id) : null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tareas"
        question="¿Qué tengo que hacer?"
        actions={
          <HeaderLink
            primary
            icon={Plus}
            href={newHref("task", panelRoutes.tasks, { due_date: view === "proximas" ? addDays(today, 1) : today })}
          >
            Nueva tarea
          </HeaderLink>
        }
      />

      <ViewTabs
        label="Vistas de tareas"
        current={view}
        tabs={[
          { key: "tablero", label: "Tablero", href: href("tablero") },
          { key: "hoy", label: "Hoy", href: href("hoy"), count: byView.hoy.length },
          { key: "proximas", label: "Próximas", href: href("proximas"), count: byView.proximas.length },
          { key: "atrasadas", label: "Atrasadas", href: href("atrasadas"), count: byView.atrasadas.length },
          { key: "todas", label: "Todas", href: href("todas"), count: byView.todas.length },
        ]}
      />

      {view === "tablero" ? (
        <>
          <TaskBoard tasks={board} here={here} />
          <p className="px-1 text-sm text-fg-muted">
            Arrastra una tarjeta de una columna a otra. En el móvil, o con el teclado, usa el desplegable de cada
            tarjeta.
          </p>
        </>
      ) : list.length === 0 ? (
        <EmptyState
          icon={CircleCheck}
          title={view === "atrasadas" ? "Nada atrasado" : view === "hoy" ? "Nada pendiente para hoy" : "Sin tareas"}
        >
          {view === "atrasadas" ? "Vas al día." : "Añade una con el botón + o desde el inbox."}
        </EmptyState>
      ) : (
        groups.map((group) => (
          <section key={group.key} aria-label={group.label ?? undefined} className="flex flex-col gap-2">
            {group.label ? <h2 className="px-1 text-sm font-semibold text-fg-subtle first-letter:uppercase">{group.label}</h2> : null}
            <RowList>
              {group.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  today={today}
                  href={editLink(task.id)}
                  context={[task.project_id ? projectName.get(task.project_id) : null, task.course_id ? courseName.get(task.course_id) : null]}
                  showDate={view !== "hoy"}
                />
              ))}
            </RowList>
          </section>
        ))
      )}

      {view !== "tablero" && done.length ? (
        <section aria-label="Completadas" className="flex flex-col gap-2">
          <h2 className="px-1 text-sm font-semibold text-fg-subtle">Completadas</h2>
          <RowList>
            {done.map((task) => (
              <TaskRow key={task.id} task={task} today={today} href={editLink(task.id)} context={[]} showDate={false} />
            ))}
          </RowList>
        </section>
      ) : null}
    </div>
  );
}

function TaskRow({
  task,
  today,
  href,
  context,
  showDate,
}: {
  task: Task;
  today: string;
  href: string;
  context: (string | null | undefined)[];
  showDate: boolean;
}) {
  const overdue = task.status !== "done" && task.due_date && task.due_date < today;
  const detail = [
    showDate && task.due_date ? relativeDay(task.due_date, today) : null,
    shortTime(task.due_time),
    ...context,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Row
      href={href}
      leading={<DoneToggle id={task.id} done={task.status === "done"} label={task.title} />}
      title={task.title}
      detail={detail || undefined}
      muted={task.status === "done"}
      trailing={
        <>
          {overdue ? <Pill tone="critical">Atrasada</Pill> : null}
          {task.status === "in_progress" || task.status === "postponed" ? (
            <Pill tone="accent">{taskStatusLabel[task.status]}</Pill>
          ) : null}
          {priorityWeight[task.priority] >= 2 && task.status !== "done" ? (
            <Pill tone={task.priority === "urgent" ? "critical" : "caution"}>{priorityLabel[task.priority]}</Pill>
          ) : null}
        </>
      }
    />
  );
}

function compareTasks(a: Task, b: Task): number {
  const ad = a.due_date ?? "9999";
  const bd = b.due_date ?? "9999";
  if (ad !== bd) return ad < bd ? -1 : 1;
  const pw = priorityWeight[b.priority] - priorityWeight[a.priority];
  if (pw) return pw;
  return (a.due_time ?? "99").localeCompare(b.due_time ?? "99");
}

function groupByDate(tasks: Task[]) {
  const groups = new Map<string, Task[]>();
  for (const task of tasks) {
    const key = task.due_date ?? "sin-fecha";
    groups.set(key, [...(groups.get(key) ?? []), task]);
  }
  return [...groups.entries()].map(([key, items]) => ({
    key,
    label: key === "sin-fecha" ? "Sin fecha" : formatShort(key),
    tasks: items,
  }));
}
