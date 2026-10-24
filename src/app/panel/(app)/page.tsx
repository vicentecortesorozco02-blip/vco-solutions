import {
  CalendarDays,
  CircleAlert,
  FolderKanban,
  GraduationCap,
  Inbox,
  Repeat,
  Sparkles,
  Sun,
  Wallet,
  CreditCard,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AddKnownProjectsButton, DoneToggle, InboxCapture } from "@/components/panel/Actions";
import { iconForAgenda, reminderIcon } from "@/components/panel/icons";
import { Card, CardTitle, HeaderLink, MiniStat, Pill, Row, RowList } from "@/components/panel/ui";
import { WeekStrip, type WeekDay } from "@/components/panel/WeekStrip";
import { panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";
import { buildAgenda, type AgendaItem } from "@/lib/life/agenda";
import { addDays, countdown, diffDays, eachDay, formatLong, greeting } from "@/lib/life/dates";
import { editHref, newHref } from "@/lib/life/links";
import { totalSum, unidentified, upcoming, upcomingTotal } from "@/lib/life/finance";
import { formatMoney, monthSummary, spentByMonth, subscriptionTotals } from "@/lib/life/money";
import { colorOf } from "@/lib/life/partners";
import { deriveReminders, topPriorities } from "@/lib/life/reminders";
import { loadInbox, loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Inicio" };

/** ¿Qué tengo que saber ahora? */
export default async function PanelHome() {
  const { profile, today, hour } = await requirePanelSession();
  const [data, inbox] = await Promise.all([loadLifeData(), loadInbox()]);
  const name = profile.display_name;

  const todayItems = buildAgenda(data, today, today);
  const todayTasks = data.tasks.filter((t) => t.due_date === today);
  const openTodayTasks = todayTasks.filter((t) => t.status !== "done");
  const todayEvents = todayItems.filter((i) => i.kind === "event");
  const overdue = data.tasks.filter((t) => t.status !== "done" && t.due_date && t.due_date < today);

  const payments7 = upcomingTotal(upcoming(data, today, 8));
  const unknownCharges = unidentified(data.charges).length;
  const subs = subscriptionTotals(data.subscriptions);
  const month = monthSummary(data.transactions, data.subscriptions, today);
  const activeProjects = data.projects.filter((p) => p.status === "active");
  const pendingUni = data.courseItems
    .filter((i) => i.status !== "done" && i.due_date && i.due_date >= today)
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1));
  const nextUni = pendingUni[0];
  const nextUniCourse = nextUni ? data.courses.find((c) => c.id === nextUni.course_id)?.name : null;

  // Una línea por día: lo que hay y lo que toca pagar.
  const week: WeekDay[] = eachDay(today, addDays(today, 6)).map((date) => {
    const items = buildAgenda(data, date, date);
    const payable = items.filter((item) => item.kind === "charge" || item.kind === "planned" || item.kind === "domain");
    return {
      date,
      items,
      due: payable.reduce((sum, item) => sum + (item.amount ?? 0), 0),
      dueUnknown: payable.filter((item) => item.amount === undefined).length,
    };
  });
  const weekDue = {
    total: week.reduce((sum, day) => sum + day.due, 0),
    unknown: week.reduce((count, day) => count + day.dueUnknown, 0),
  };
  const projectOf = new Map<string, string>();
  for (const task of data.tasks) if (task.project_id) projectOf.set(task.id, task.project_id);
  for (const sub of data.subscriptions) if (sub.project_id) projectOf.set(sub.id, sub.project_id);
  for (const domain of data.domains) if (domain.project_id) projectOf.set(domain.id, domain.project_id);
  const colorOfItem = (item: AgendaItem) => {
    const projectId = projectOf.get(item.sourceId);
    return projectId ? colorOf(data.projects, projectId) : null;
  };

  const focus = topPriorities(data, today);
  const reminders = deriveReminders(data, today).slice(0, 8);

  const isEmpty =
    data.tasks.length + data.events.length + data.projects.length + data.subscriptions.length + data.courses.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1 pt-2">
        <p className="text-sm font-medium text-fg-subtle first-letter:uppercase">{formatLong(today)}</p>
        <h1 className="text-title font-semibold tracking-[-0.03em] text-fg">
          {name ? `${greeting(hour)}, ${name}` : greeting(hour)}
        </h1>
        {name ? null : (
          <Link href={panelRoutes.settings} className="w-fit text-sm font-medium text-accent-text hover:underline">
            ¿Cómo te llamas? Añade tu nombre
          </Link>
        )}
      </header>

      {isEmpty ? (
        <Card className="flex flex-col gap-4">
          <CardTitle icon={Sparkles}>Empieza aquí</CardTitle>
          <p className="max-w-[60ch] text-[0.9375rem] text-fg-muted">
            Tu panel está vacío. Añade tus proyectos de un toque y después tus suscripciones y asignaturas:
            a partir de ahí, esta pantalla te dirá cada mañana qué importa.
          </p>
          <div className="flex flex-wrap gap-2">
            <AddKnownProjectsButton />
            <HeaderLink href={newHref("subscription", panelRoutes.home)}>Añadir una suscripción</HeaderLink>
            <HeaderLink href={newHref("course", panelRoutes.home)}>Añadir una asignatura</HeaderLink>
          </div>
        </Card>
      ) : null}

      <section aria-label="Resumen" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <MiniStat
          label="Hoy"
          icon={Sun}
          href={panelRoutes.tasks}
          value={openTodayTasks.length + todayEvents.length}
          detail={`${plural(openTodayTasks.length, "tarea", "tareas")} · ${plural(todayEvents.length, "evento", "eventos")}`}
          tone={overdue.length ? "critical" : "default"}
        />
        <MiniStat
          label="Pagos 7 días"
          icon={CreditCard}
          href={panelRoutes.money}
          value={formatMoney(totalSum(payments7), { round: totalSum(payments7) >= 100 })}
          detail={payments7.unknown ? `${payments7.unknown} sin importe` : payments7.estimated > 0 ? "parte estimado" : "previstos"}
        />
        <MiniStat
          label="Universidad"
          icon={GraduationCap}
          href={panelRoutes.university}
          value={pendingUni.length}
          detail={
            nextUni?.due_date
              ? `${nextUniCourse ?? nextUni.title} · ${countdown(nextUni.due_date, today)}`
              : plural(pendingUni.length, "entrega", "entregas")
          }
          tone={nextUni?.due_date && diffDays(today, nextUni.due_date) <= 2 ? "caution" : "default"}
        />
        <MiniStat
          label="Proyectos"
          icon={FolderKanban}
          href={panelRoutes.projects}
          value={activeProjects.length}
          detail={activeProjects.length === 1 ? "activo" : "activos"}
        />
        <MiniStat
          label="Suscripciones"
          icon={Repeat}
          href={panelRoutes.subscriptions}
          value={formatMoney(subs.monthly, { round: subs.monthly >= 100 })}
          detail={subs.unknown ? `al mes · ${subs.unknown} sin confirmar` : "al mes"}
        />
        <MiniStat
          label="Gastado"
          icon={Wallet}
          href={panelRoutes.money}
          value={formatMoney(spentByMonth(data.charges, today) + month.spent, { round: true })}
          detail={unknownCharges ? `${unknownCharges} sin identificar` : "este mes"}
        />
      </section>

      <section aria-labelledby="week-title" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="week-title" className="text-lg font-semibold tracking-[-0.015em] text-fg">
            Los próximos siete días
          </h2>
          <Link href={panelRoutes.calendar} className="text-sm font-medium text-accent-text hover:underline">
            Calendario
          </Link>
        </div>
        <WeekStrip days={week} today={today} colorOf={colorOfItem} />
        <p className="px-1 text-sm text-fg-muted">
          {weekDue.total > 0 ? `${formatMoney(weekDue.total)} a pagar esta semana` : "Sin pagos esta semana"}
          {weekDue.unknown > 0 ? ` · ${weekDue.unknown} sin importe confirmado` : ""}
          {" · "}
          {plural(week.reduce((count, day) => count + day.items.length, 0), "cosa en la agenda", "cosas en la agenda")}
        </p>
      </section>

      <section aria-labelledby="focus-title" className="flex flex-col gap-3">
        <h2 id="focus-title" className="text-lg font-semibold tracking-[-0.015em] text-fg">
          Lo más importante ahora
        </h2>
        {focus.length ? (
          <ol className="grid gap-3 md:grid-cols-3">
            {focus.map((item, index) => (
              <li key={item.key} className="flex items-start gap-3 rounded-2xl bg-surface p-4">
                {item.taskId ? (
                  <DoneToggle id={item.taskId} done={false} label={item.title} />
                ) : (
                  <span className="tnum grid size-8 shrink-0 place-items-center rounded-full bg-accent-quiet text-sm font-semibold text-accent-text">
                    {index + 1}
                  </span>
                )}
                <Link href={item.href} className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
                  <span className="text-[0.9375rem] font-semibold text-fg">{item.title}</span>
                  <span className="text-sm text-fg-muted">{item.reason}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-2xl bg-surface px-5 py-4 text-[0.9375rem] text-fg-muted">
            Nada urgente. Buen momento para avanzar en un proyecto.
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="today-title" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="today-title" className="text-lg font-semibold tracking-[-0.015em] text-fg">
              Hoy
            </h2>
            <Link href={panelRoutes.calendar} className="text-sm font-medium text-accent-text hover:underline">
              Calendario
            </Link>
          </div>
          {todayItems.length ? (
            <RowList>
              {todayItems.map((item) => {
                const Icon = iconForAgenda(item.kind, item.category);
                const task = item.kind === "task" ? data.tasks.find((t) => t.id === item.sourceId) : null;
                return (
                  <Row
                    key={item.key}
                    href={
                      item.kind === "task"
                        ? editHref("task", item.sourceId, panelRoutes.home)
                        : item.kind === "event"
                          ? editHref("event", item.sourceId, panelRoutes.home)
                          : item.kind === "course"
                            ? editHref("courseItem", item.sourceId, panelRoutes.home)
                            : panelRoutes.dates
                    }
                    icon={Icon}
                    leading={task ? <DoneToggle id={task.id} done={task.status === "done"} label={task.title} /> : undefined}
                    title={item.title}
                    detail={[item.time ? (item.endTime ? `${item.time}–${item.endTime}` : item.time) : null, item.detail]
                      .filter(Boolean)
                      .join(" · ") || undefined}
                    muted={item.done}
                    trailing={item.amount !== undefined ? <span className="tnum text-sm font-medium text-fg">{formatMoney(item.amount)}</span> : undefined}
                  />
                );
              })}
            </RowList>
          ) : (
            <p className="rounded-2xl bg-surface px-5 py-4 text-[0.9375rem] text-fg-muted">Día libre en la agenda.</p>
          )}
        </section>

        <section aria-labelledby="alerts-title" className="flex flex-col gap-3">
          <h2 id="alerts-title" className="text-lg font-semibold tracking-[-0.015em] text-fg">
            Avisos
          </h2>
          {reminders.length ? (
            <ul className="flex flex-col gap-2">
              {reminders.map((reminder) => {
                const Icon = reminder.level === "critical" ? CircleAlert : reminderIcon[reminder.kind];
                return (
                  <li key={reminder.key}>
                    <Link
                      href={reminder.href}
                      className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 transition-colors hover:bg-surface-raised"
                    >
                      <Icon
                        className={cn(
                          "size-5 shrink-0",
                          reminder.level === "critical"
                            ? "text-critical"
                            : reminder.level === "soon"
                              ? "text-caution"
                              : "text-fg-subtle",
                        )}
                        strokeWidth={1.9}
                        aria-hidden
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[0.9375rem] font-medium text-fg">{reminder.title}</span>
                        <span className="truncate text-sm text-fg-muted">{reminder.detail}</span>
                      </span>
                      {reminder.level === "critical" ? <Pill tone="critical">Urgente</Pill> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-2xl bg-surface px-5 py-4 text-[0.9375rem] text-fg-muted">Sin avisos. Todo en orden.</p>
          )}

          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-[-0.015em] text-fg">
                <Inbox className="size-5 text-fg-subtle" strokeWidth={1.9} aria-hidden />
                Inbox
              </h2>
              {inbox.length ? (
                <Link href={panelRoutes.inbox} className="text-sm font-medium text-accent-text hover:underline">
                  {plural(inbox.length, "por ordenar", "por ordenar")}
                </Link>
              ) : null}
            </div>
            <InboxCapture />
          </div>
        </section>
      </div>

      <p className="flex items-center gap-2 text-xs text-fg-subtle">
        <CalendarDays className="size-3.5" aria-hidden />
        Pulsa ⌘K o Ctrl+K para buscar cualquier cosa.
      </p>
    </div>
  );
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
