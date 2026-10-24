import { ArrowLeft, ArrowUpRight, CircleCheck, Globe, Handshake, Pencil, Plus, Receipt, Repeat, Users, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DoneToggle } from "@/components/panel/Actions";
import { Card, CardTitle, HeaderLink, Pill, ProgressBar, Row, RowList, StatCard, tagClass } from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";
import { countdown, formatShort, formatWithYear, relativeDay } from "@/lib/life/dates";
import { editHref, newHref } from "@/lib/life/links";
import { formatMoney } from "@/lib/life/money";
import { frequencyLabel, priorityLabel, projectStatusLabel } from "@/lib/life/model";
import { isSpend } from "@/lib/life/finance";
import { agreedShare, partnerActivity, partnerBalances, partnersOf, projectCharges, projectPaidBy } from "@/lib/life/partners";
import { monthlyCost } from "@/lib/life/recurrence";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Proyecto" };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();
  const { id } = await params;
  const project = data.projects.find((p) => p.id === id);
  if (!project) notFound();

  const here = panelRoutes.project(project.id);
  const tasks = data.tasks
    .filter((t) => t.project_id === project.id)
    .sort((a, b) => Number(a.status === "done") - Number(b.status === "done") || (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));
  const subs = data.subscriptions.filter((s) => s.project_id === project.id);
  const partners = partnersOf(data, project.id);
  const balances = partnerBalances(data, project.id);
  const activity = partnerActivity(data, project.id);
  const expenses = projectCharges(data, project.id);
  const expensesTotal = expenses.reduce((sum, e) => sum + Number(e.charge.amount), 0);
  const putIn = projectPaidBy(expenses);
  const agreed = agreedShare(partners.map((row) => row.link));
  const partnerName = new Map(data.partners.map((p) => [p.id, p.name]));
  const domains = data.domains.filter((d) => d.project_id === project.id);
  const spending = data.transactions.filter((t) => t.project_id === project.id && t.kind === "expense" && !t.planned);

  // Subscriptions whose cost is not known yet are counted apart, not as 0 €.
  const monthly =
    subs.filter((s) => s.status !== "cancelled").reduce((sum, s) => sum + (monthlyCost(s) ?? 0), 0) +
    domains.reduce((sum, d) => sum + Number(d.cost ?? 0) / 12, 0);
  const unknownCost =
    subs.filter((s) => s.status !== "cancelled" && monthlyCost(s) === null).length +
    domains.filter((d) => d.cost === null).length;
  const spent =
    spending.reduce((sum, t) => sum + Number(t.amount), 0) +
    data.charges
      .filter((c) => isSpend(c) && (c.project_id === project.id || (c.subscription_id !== null && subs.some((s) => s.id === c.subscription_id))))
      .reduce((sum, c) => sum + Number(c.amount), 0);
  const open = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link href={panelRoutes.projects} className="inline-flex min-h-9 w-fit items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg">
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
          Proyectos
        </Link>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={project.status === "active" ? "accent" : "neutral"}>{projectStatusLabel[project.status]}</Pill>
              <Pill>Prioridad {priorityLabel[project.priority].toLowerCase()}</Pill>
            </div>
            <h1 className="flex items-center gap-3 text-title font-semibold tracking-[-0.025em] text-fg">
              <span className={cn("size-3 shrink-0 rounded-full", tagClass(project.color, "fill"))} aria-hidden />
              {project.name}
            </h1>
            {project.description ? <p className="max-w-[60ch] text-[0.9375rem] text-fg-muted">{project.description}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-surface px-4 text-sm font-medium text-fg hover:bg-surface-raised"
              >
                <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden />
                Abrir
              </a>
            ) : null}
            <HeaderLink icon={Pencil} href={editHref("project", project.id, here)}>
              Editar
            </HeaderLink>
          </div>
        </header>
      </div>

      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="col-span-2 flex flex-col justify-between gap-3 rounded-2xl bg-surface p-5 lg:col-span-1">
          <span className="text-xs font-semibold tracking-[0.06em] text-fg-subtle uppercase">Progreso</span>
          <span className="tnum text-stat font-semibold tracking-[-0.03em] text-fg">{project.progress} %</span>
          <ProgressBar value={project.progress} label={`Progreso de ${project.name}`} />
        </div>
        <StatCard label="Tareas abiertas" value={open} detail={`${tasks.length - open} hechas`} />
        <StatCard
          label="Coste fijo"
          value={monthly > 0 ? formatMoney(monthly) : unknownCost ? "Pendiente de confirmar" : formatMoney(0)}
          detail={unknownCost ? `al mes · ${unknownCost} sin confirmar` : "al mes"}
        />
        <StatCard
          label="Fecha objetivo"
          value={project.target_date ? formatShort(project.target_date) : "—"}
          detail={project.target_date ? countdown(project.target_date, today) : project.start_date ? `desde ${formatWithYear(project.start_date)}` : "sin fecha"}
        />
      </section>

      <section aria-labelledby="expenses-title" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 id="expenses-title" className="text-lg font-semibold tracking-[-0.015em]">
            Gastos del proyecto
          </h2>
          <div className="flex flex-wrap gap-2">
            <HeaderLink icon={Receipt} href={newHref("charge", here, { project_id: project.id, shared: "false" })}>
              Gasto de uno solo
            </HeaderLink>
            <HeaderLink icon={Users} href={newHref("charge", here, { project_id: project.id, shared: "true" })}>
              Gasto compartido
            </HeaderLink>
          </div>
        </div>

        {expenses.length === 0 ? (
          <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
            Ningún gasto apuntado a este proyecto. Un gasto de uno solo es entero de quien lo paga; uno compartido se
            reparte por los porcentajes acordados.
          </p>
        ) : (
          <>
            <RowList>
              {expenses.map(({ charge, paidBy, split, shared, date }) => (
                <Row
                  key={charge.id}
                  href={editHref("charge", charge.id, here)}
                  icon={shared ? Users : Receipt}
                  iconColor={shared ? "sky" : project.color}
                  title={charge.description || "Gasto"}
                  detail={[
                    date ? formatShort(date) : "sin fecha",
                    `pagó ${paidBy ? paidBy.name : "tú"}`,
                    shared
                      ? split.undecided
                        ? "reparto sin acordar"
                        : split.shares
                            .map(
                              (share) =>
                                `${share.partnerId ? (partnerName.get(share.partnerId) ?? "socio") : "tú"} ${formatMoney(share.amount)}`,
                            )
                            .join(" · ")
                      : `entero de ${paidBy ? paidBy.name : "tú"}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  trailing={
                    <>
                      <Pill tone={shared ? "accent" : "neutral"}>{shared ? "Compartido" : "De uno solo"}</Pill>
                      <span className="tnum text-sm font-semibold text-fg">{formatMoney(Number(charge.amount))}</span>
                    </>
                  }
                />
              ))}
            </RowList>
            <p className="px-1 text-sm text-fg-muted">
              {formatMoney(expensesTotal)} gastados en el proyecto ·{" "}
              {putIn
                .map(
                  (row) =>
                    `${row.partnerId ? (partnerName.get(row.partnerId) ?? "socio") : "tú"} ${formatMoney(row.amount)}`,
                )
                .join(" · ")}
            </p>
          </>
        )}
      </section>

      <section aria-labelledby="partners-title" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 id="partners-title" className="text-lg font-semibold tracking-[-0.015em]">
            Socios y gastos compartidos
          </h2>
          <div className="flex flex-wrap gap-2">
            <HeaderLink icon={Plus} href={newHref("partner", here)}>
              Nuevo socio
            </HeaderLink>
            <HeaderLink icon={Handshake} href={newHref("projectPartner", here, { project_id: project.id })}>
              Añadir al proyecto
            </HeaderLink>
          </div>
        </div>

        {partners.length === 0 ? (
          <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
            Todavía no hay socios en este proyecto. Añade uno y podrás repartir gastos, apuntar quién pagó cada cosa y
            ver quién debe qué.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card aria-labelledby="who-title">
              <CardTitle icon={Handshake}>
                <span id="who-title">Quién está dentro</span>
              </CardTitle>
              <ul className="flex flex-col gap-3">
                {partners.map(({ link, partner }) => {
                  const balance = balances.find((row) => row.partner.id === partner.id);
                  return (
                    <li key={link.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <Link
                        href={editHref("projectPartner", link.id, here)}
                        scroll={false}
                        className="flex min-h-10 min-w-0 flex-1 flex-col justify-center"
                      >
                        <span className="truncate text-[0.9375rem] font-medium text-fg">{partner.name}</span>
                        <span className="text-sm text-fg-muted">
                          {[link.role, link.share === null ? "reparto sin acordar" : `le toca el ${Number(link.share)} %`]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </Link>
                      {balance && Math.abs(balance.net) > 0.004 ? (
                        <span className={cn("tnum text-sm font-semibold", balance.net > 0 ? "text-critical" : "text-positive")}>
                          {balance.net > 0 ? `le debes ${formatMoney(balance.net)}` : `te debe ${formatMoney(-balance.net)}`}
                        </span>
                      ) : (
                        <span className="text-sm text-fg-muted">en paz</span>
                      )}
                    </li>
                  );
                })}
                <li className="flex items-baseline justify-between gap-3 border-t border-line-soft pt-3 text-sm">
                  <span className="text-fg-muted">Repartido entre socios</span>
                  <span className={cn("tnum font-semibold", agreed > 100 ? "text-critical" : "text-fg")}>
                    {agreed} %{agreed > 100 ? " · pasa del 100 %" : agreed < 100 ? ` · tuyo el ${100 - agreed} %` : ""}
                  </span>
                </li>
              </ul>
            </Card>

            <Card aria-labelledby="paid-title">
              <CardTitle icon={Receipt}>
                <span id="paid-title">Quién ha pagado qué</span>
              </CardTitle>
              {activity.length ? (
                <ul className="flex flex-col gap-3">
                  {activity.slice(0, 12).map(({ charge, paidBy, split, date }) => (
                    <li key={charge.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <Link
                        href={editHref("charge", charge.id, here)}
                        scroll={false}
                        className="flex min-h-10 min-w-0 flex-1 flex-col justify-center"
                      >
                        <span className="truncate text-[0.9375rem] font-medium text-fg">
                          {charge.description || "Gasto"}
                        </span>
                        <span className="text-sm text-fg-muted">
                          {[
                            date ? formatShort(date) : "sin fecha",
                            `pagó ${paidBy ? paidBy.name : "tú"}`,
                            split.undecided
                              ? "reparto sin acordar"
                              : split.shares
                                  .map((share) =>
                                    `${share.partnerId ? (partnerName.get(share.partnerId) ?? "socio") : "tú"} ${formatMoney(share.amount)}`,
                                  )
                                  .join(" · "),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </Link>
                      <span className="tnum text-sm font-semibold text-fg">{formatMoney(Number(charge.amount))}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-fg-muted">
                  Ningún gasto compartido todavía. Apunta uno y marca quién lo pagó: el reparto sale de los porcentajes
                  acordados.
                </p>
              )}
            </Card>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="tasks-title" className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 id="tasks-title" className="text-lg font-semibold tracking-[-0.015em]">
              Tareas
            </h2>
            <Link
              href={newHref("task", here, { project_id: project.id })}
              scroll={false}
              className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-accent-text"
            >
              <Plus className="size-4" strokeWidth={2.25} aria-hidden />
              Tarea
            </Link>
          </div>
          {tasks.length ? (
            <RowList>
              {tasks.map((task) => (
                <Row
                  key={task.id}
                  href={editHref("task", task.id, here)}
                  leading={<DoneToggle id={task.id} done={task.status === "done"} label={task.title} />}
                  title={task.title}
                  muted={task.status === "done"}
                  detail={task.due_date ? relativeDay(task.due_date, today) : undefined}
                />
              ))}
            </RowList>
          ) : (
            <p className="flex items-center gap-2 rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
              <CircleCheck className="size-4" aria-hidden /> Sin tareas en este proyecto.
            </p>
          )}

          {project.notes ? (
            <div className="mt-4 rounded-2xl bg-surface p-5">
              <h2 className="mb-2 text-sm font-semibold text-fg-subtle">Notas</h2>
              <p className="text-[0.9375rem] whitespace-pre-line text-fg">{project.notes}</p>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="costs-title" className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 id="costs-title" className="text-lg font-semibold tracking-[-0.015em]">
              Costes
            </h2>
            <Link
              href={newHref("subscription", here, { project_id: project.id })}
              scroll={false}
              className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-accent-text"
            >
              <Plus className="size-4" strokeWidth={2.25} aria-hidden />
              Suscripción
            </Link>
          </div>
          {subs.length + domains.length + spending.length ? (
            <RowList>
              {subs.map((s) => (
                <Row
                  key={s.id}
                  href={editHref("subscription", s.id, here)}
                  icon={Repeat}
                  title={s.name}
                  muted={!s.active}
                  detail={frequencyLabel[s.frequency]}
                  trailing={<span className="tnum text-sm font-semibold">{formatMoney(Number(s.amount))}</span>}
                />
              ))}
              {domains.map((d) => (
                <Row
                  key={d.id}
                  href={editHref("domain", d.id, here)}
                  icon={Globe}
                  title={d.domain}
                  detail={d.renews_on ? `renueva ${relativeDay(d.renews_on, today)}` : "Dominio"}
                  trailing={d.cost ? <span className="tnum text-sm font-semibold">{formatMoney(Number(d.cost))}/año</span> : undefined}
                />
              ))}
              {spending.length ? (
                <Row
                  href={panelRoutes.money}
                  icon={Wallet}
                  title="Gastos sueltos"
                  detail={`${spending.length} movimiento${spending.length === 1 ? "" : "s"}`}
                  trailing={<span className="tnum text-sm font-semibold">{formatMoney(spent)}</span>}
                />
              ) : null}
            </RowList>
          ) : (
            <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">Sin costes asociados.</p>
          )}
        </section>
      </div>
    </div>
  );
}
