import {
  ArrowLeft,
  ArrowUpRight,
  CircleCheck,
  FileText,
  Globe,
  KeyRound,
  Landmark,
  Handshake,
  Pencil,
  Plus,
  Receipt,
  Repeat,
  Users,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DoneToggle } from "@/components/panel/Actions";
import { ProjectLogo } from "@/components/panel/ProjectLogo";
import { RowActions } from "@/components/panel/RowActions";
import {
  Card,
  CardTitle,
  HeaderLink,
  Pill,
  Row,
  RowList,
  StatCard,
  ViewTabs,
  tagClass,
} from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";
import {
  countdown,
  formatShort,
  formatWithYear,
  relativeDay,
} from "@/lib/life/dates";
import { editHref, newHref } from "@/lib/life/links";
import { formatMoney } from "@/lib/life/money";
import {
  frequencyLabel,
  priorityLabel,
  projectStatusLabel,
} from "@/lib/life/model";
import { isSpend } from "@/lib/life/finance";
import {
  agreedShare,
  partnerActivity,
  partnerBalances,
  partnersOf,
  projectCharges,
  projectPaidBy,
} from "@/lib/life/partners";
import { monthlyCost } from "@/lib/life/recurrence";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Proyecto" };

const TABS = [
  { key: "resumen", label: "Resumen" },
  { key: "gastos", label: "Gastos" },
  { key: "socios", label: "Socios" },
  { key: "finanzas", label: "Finanzas" },
  { key: "cuentas", label: "Cuentas" },
  { key: "accesos", label: "Accesos" },
  { key: "documentos", label: "Documentos" },
  { key: "notas", label: "Notas" },
  { key: "info", label: "Información" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();
  const { id } = await params;
  const project = data.projects.find((p) => p.id === id);
  if (!project) notFound();

  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.some((t) => t.key === rawTab)
    ? (rawTab as Tab)
    : "resumen";
  const base = panelRoutes.project(project.id);
  const here = tab === "resumen" ? base : `${base}?tab=${tab}`;
  const accounts = data.accounts.filter((a) => a.project_id === project.id);
  const documents = data.vault.filter((v) => v.project_id === project.id);
  const accesses = data.access.filter((a) => a.project_id === project.id);
  const tasks = data.tasks
    .filter((t) => t.project_id === project.id)
    .sort(
      (a, b) =>
        Number(a.status === "done") - Number(b.status === "done") ||
        (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"),
    );
  const subs = data.subscriptions.filter((s) => s.project_id === project.id);
  const partners = partnersOf(data, project.id);
  const balances = partnerBalances(data, project.id);
  const activity = partnerActivity(data, project.id);
  const expenses = projectCharges(data, project.id);
  const expensesTotal = expenses.reduce(
    (sum, e) => sum + Number(e.charge.amount),
    0,
  );
  const putIn = projectPaidBy(expenses);
  const agreed = agreedShare(partners.map((row) => row.link));
  const partnerName = new Map(data.partners.map((p) => [p.id, p.name]));
  const domains = data.domains.filter((d) => d.project_id === project.id);
  const spending = data.transactions.filter(
    (t) => t.project_id === project.id && t.kind === "expense" && !t.planned,
  );

  // Subscriptions whose cost is not known yet are counted apart, not as 0 €.
  const monthly =
    subs
      .filter((s) => s.status !== "cancelled")
      .reduce((sum, s) => sum + (monthlyCost(s) ?? 0), 0) +
    domains.reduce((sum, d) => sum + Number(d.cost ?? 0) / 12, 0);
  const unknownCost =
    subs.filter((s) => s.status !== "cancelled" && monthlyCost(s) === null)
      .length + domains.filter((d) => d.cost === null).length;
  const spent =
    spending.reduce((sum, t) => sum + Number(t.amount), 0) +
    data.charges
      .filter(
        (c) =>
          isSpend(c) &&
          (c.project_id === project.id ||
            (c.subscription_id !== null &&
              subs.some((s) => s.id === c.subscription_id))),
      )
      .reduce((sum, c) => sum + Number(c.amount), 0);
  const open = tasks.filter((t) => t.status !== "done").length;
  const counts: Partial<Record<Tab, number>> = {
    gastos: expenses.length || undefined,
    socios: partners.length || undefined,
    cuentas: accounts.length || undefined,
    accesos: accesses.length || undefined,
    documentos: documents.length || undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href={panelRoutes.projects}
          className="inline-flex min-h-9 w-fit items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
          Proyectos
        </Link>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 items-end gap-4">
            <ProjectLogo
              id={project.id}
              name={project.name}
              logo={project.logo ?? null}
              color={project.color}
            />
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={project.status === "active" ? "accent" : "neutral"}>
                  {projectStatusLabel[project.status]}
                </Pill>
                <Pill>
                  Prioridad {priorityLabel[project.priority].toLowerCase()}
                </Pill>
              </div>
              <h1 className="flex items-center gap-3 text-title font-semibold tracking-[-0.025em] text-fg">
                <span
                  className={cn(
                    "size-3 shrink-0 rounded-full",
                    tagClass(project.color, "fill"),
                  )}
                  aria-hidden
                />
                {project.name}
              </h1>
              {project.description ? (
                <p className="max-w-[60ch] text-[0.9375rem] text-fg-muted">
                  {project.description}
                </p>
              ) : null}
            </div>
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
            <HeaderLink
              icon={Pencil}
              href={editHref("project", project.id, here)}
            >
              Editar
            </HeaderLink>
          </div>
        </header>
      </div>

      <ViewTabs
        label="Secciones del proyecto"
        current={tab}
        tabs={TABS.map((t) => ({
          key: t.key,
          label: t.label,
          href: t.key === "resumen" ? base : `${base}?tab=${t.key}`,
          count: counts[t.key],
        }))}
      />

      {tab === "resumen" ? (
        <>
          <section
            aria-label="Resumen"
            className="grid grid-cols-2 gap-3 lg:grid-cols-4"
          >
            <StatCard
              label="Estado"
              value={projectStatusLabel[project.status]}
            />
            <StatCard
              label="Tareas abiertas"
              value={open}
              detail={`${tasks.length - open} hechas`}
            />
            <StatCard
              label="Coste fijo"
              value={
                monthly > 0
                  ? formatMoney(monthly)
                  : unknownCost
                    ? "Pendiente de confirmar"
                    : formatMoney(0)
              }
              detail={
                unknownCost ? `al mes · ${unknownCost} sin confirmar` : "al mes"
              }
            />
            <StatCard
              label="Fecha objetivo"
              value={
                project.target_date ? formatShort(project.target_date) : "—"
              }
              detail={
                project.target_date
                  ? countdown(project.target_date, today)
                  : project.start_date
                    ? `desde ${formatWithYear(project.start_date)}`
                    : "sin fecha"
              }
            />
          </section>

          <section
            aria-labelledby="tasks-title"
            className="flex flex-col gap-3"
          >
            <div className="flex items-center justify-between px-1">
              <h2
                id="tasks-title"
                className="text-lg font-semibold tracking-[-0.015em]"
              >
                Pendientes
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
                    leading={
                      <DoneToggle
                        id={task.id}
                        done={task.status === "done"}
                        label={task.title}
                      />
                    }
                    title={task.title}
                    muted={task.status === "done"}
                    detail={
                      task.due_date
                        ? relativeDay(task.due_date, today)
                        : undefined
                    }
                  />
                ))}
              </RowList>
            ) : (
              <p className="flex items-center gap-2 rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
                <CircleCheck className="size-4" aria-hidden /> Sin tareas en
                este proyecto.
              </p>
            )}
          </section>
        </>
      ) : null}

      {tab === "gastos" ? (
        <>
          <section
            aria-labelledby="expenses-title"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <h2
                id="expenses-title"
                className="text-lg font-semibold tracking-[-0.015em]"
              >
                Gastos del proyecto
              </h2>
              <div className="flex flex-wrap gap-2">
                <HeaderLink
                  icon={Receipt}
                  href={newHref("charge", here, {
                    project_id: project.id,
                    shared: "false",
                  })}
                >
                  Gasto de uno solo
                </HeaderLink>
                <HeaderLink
                  icon={Users}
                  href={newHref("charge", here, {
                    project_id: project.id,
                    shared: "true",
                  })}
                >
                  Gasto compartido
                </HeaderLink>
              </div>
            </div>

            {expenses.length === 0 ? (
              <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
                Ningún gasto apuntado a este proyecto. Un gasto de uno solo es
                entero de quien lo paga; uno compartido se reparte por los
                porcentajes acordados.
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
                          <Pill tone={shared ? "accent" : "neutral"}>
                            {shared ? "Compartido" : "De uno solo"}
                          </Pill>
                          <span className="tnum text-sm font-semibold text-fg">
                            {formatMoney(Number(charge.amount), {
                              currency: charge.currency,
                            })}
                          </span>
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
        </>
      ) : null}

      {tab === "socios" ? (
        <>
          <section
            aria-labelledby="partners-title"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <h2
                id="partners-title"
                className="text-lg font-semibold tracking-[-0.015em]"
              >
                Socios y gastos compartidos
              </h2>
              <div className="flex flex-wrap gap-2">
                <HeaderLink icon={Plus} href={newHref("partner", here)}>
                  Nuevo socio
                </HeaderLink>
                <HeaderLink
                  icon={Handshake}
                  href={newHref("projectPartner", here, {
                    project_id: project.id,
                  })}
                >
                  Añadir al proyecto
                </HeaderLink>
              </div>
            </div>

            {partners.length === 0 ? (
              <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
                Todavía no hay socios en este proyecto. Añade uno y podrás
                repartir gastos, apuntar quién pagó cada cosa y ver quién debe
                qué.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card aria-labelledby="who-title">
                  <CardTitle icon={Handshake}>
                    <span id="who-title">Quién está dentro</span>
                  </CardTitle>
                  <ul className="flex flex-col gap-3">
                    {partners.map(({ link, partner }) => {
                      const balance = balances.find(
                        (row) => row.partner.id === partner.id,
                      );
                      return (
                        <li
                          key={link.id}
                          className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"
                        >
                          <Link
                            href={editHref("projectPartner", link.id, here)}
                            scroll={false}
                            className="flex min-h-10 min-w-0 flex-1 flex-col justify-center"
                          >
                            <span className="truncate text-[0.9375rem] font-medium text-fg">
                              {partner.name}
                            </span>
                            <span className="text-sm text-fg-muted">
                              {[
                                link.role,
                                link.share === null
                                  ? "reparto sin acordar"
                                  : `le toca el ${Number(link.share)} %`,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </Link>
                          {balance && Math.abs(balance.net) > 0.004 ? (
                            <span
                              className={cn(
                                "tnum text-sm font-semibold",
                                balance.net > 0
                                  ? "text-critical"
                                  : "text-positive",
                              )}
                            >
                              {balance.net > 0
                                ? `le debes ${formatMoney(balance.net)}`
                                : `te debe ${formatMoney(-balance.net)}`}
                            </span>
                          ) : (
                            <span className="text-sm text-fg-muted">
                              en paz
                            </span>
                          )}
                        </li>
                      );
                    })}
                    <li className="flex items-baseline justify-between gap-3 border-t border-line-soft pt-3 text-sm">
                      <span className="text-fg-muted">
                        Repartido entre socios
                      </span>
                      <span
                        className={cn(
                          "tnum font-semibold",
                          agreed > 100 ? "text-critical" : "text-fg",
                        )}
                      >
                        {agreed} %
                        {agreed > 100
                          ? " · pasa del 100 %"
                          : agreed < 100
                            ? ` · tuyo el ${100 - agreed} %`
                            : ""}
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
                      {activity
                        .slice(0, 12)
                        .map(({ charge, paidBy, split, date }) => (
                          <li
                            key={charge.id}
                            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"
                          >
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
                                        .map(
                                          (share) =>
                                            `${share.partnerId ? (partnerName.get(share.partnerId) ?? "socio") : "tú"} ${formatMoney(share.amount)}`,
                                        )
                                        .join(" · "),
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            </Link>
                            <span className="tnum text-sm font-semibold text-fg">
                              {formatMoney(Number(charge.amount), {
                                currency: charge.currency,
                              })}
                            </span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-fg-muted">
                      Ningún gasto compartido todavía. Apunta uno y marca quién
                      lo pagó: el reparto sale de los porcentajes acordados.
                    </p>
                  )}
                </Card>
              </div>
            )}
          </section>
        </>
      ) : null}

      {tab === "finanzas" ? (
        <>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <section
              aria-labelledby="costs-title"
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between px-1">
                <h2
                  id="costs-title"
                  className="text-lg font-semibold tracking-[-0.015em]"
                >
                  Costes
                </h2>
                <Link
                  href={newHref("subscription", here, {
                    project_id: project.id,
                  })}
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
                      trailing={
                        <span className="tnum text-sm font-semibold">
                          {formatMoney(Number(s.amount), {
                            currency: s.currency,
                          })}
                        </span>
                      }
                    />
                  ))}
                  {domains.map((d) => (
                    <Row
                      key={d.id}
                      href={editHref("domain", d.id, here)}
                      icon={Globe}
                      title={d.domain}
                      detail={
                        d.renews_on
                          ? `renueva ${relativeDay(d.renews_on, today)}`
                          : "Dominio"
                      }
                      trailing={
                        d.cost ? (
                          <span className="tnum text-sm font-semibold">
                            {formatMoney(Number(d.cost))}/año
                          </span>
                        ) : undefined
                      }
                    />
                  ))}
                  {spending.length ? (
                    <Row
                      href={panelRoutes.money}
                      icon={Wallet}
                      title="Gastos sueltos"
                      detail={`${spending.length} movimiento${spending.length === 1 ? "" : "s"}`}
                      trailing={
                        <span className="tnum text-sm font-semibold">
                          {formatMoney(spent)}
                        </span>
                      }
                    />
                  ) : null}
                </RowList>
              ) : (
                <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
                  Sin costes asociados.
                </p>
              )}
            </section>
          </div>
        </>
      ) : null}

      {tab === "cuentas" ? (
        <TabList
          title="Cuentas del proyecto"
          addLabel="Cuenta"
          addHref={newHref("account", here, { project_id: project.id })}
          empty="Ninguna cuenta enlazada. Crea una o, en una existente, elige este proyecto."
        >
          {accounts.map((a) => (
            <Row
              key={a.id}
              href={editHref("account", a.id, here)}
              icon={Landmark}
              title={a.name}
              detail={
                [a.institution, a.iban_last4 ? `··${a.iban_last4}` : null]
                  .filter(Boolean)
                  .join(" · ") || undefined
              }
              trailing={
                a.balance !== null ? (
                  <span className="tnum text-sm font-semibold">
                    {formatMoney(Number(a.balance))}
                  </span>
                ) : undefined
              }
              actions={
                <RowActions
                  kind="account"
                  id={a.id}
                  label={a.name}
                  editHref={editHref("account", a.id, here)}
                />
              }
            />
          ))}
        </TabList>
      ) : null}

      {tab === "accesos" ? (
        <TabList
          title="Accesos"
          note="Usuario, enlace y en qué gestor está la contraseña. La contraseña no se guarda aquí."
          addLabel="Acceso"
          addHref={newHref("access", here, { project_id: project.id })}
          empty="Sin accesos apuntados."
        >
          {accesses.map((a) => (
            <Row
              key={a.id}
              href={editHref("access", a.id, here)}
              icon={KeyRound}
              title={a.title}
              detail={
                [
                  a.username,
                  a.stored_in ? `contraseña en ${a.stored_in}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || undefined
              }
              actions={
                <RowActions
                  kind="access"
                  id={a.id}
                  label={a.title}
                  editHref={editHref("access", a.id, here)}
                />
              }
            />
          ))}
        </TabList>
      ) : null}

      {tab === "documentos" ? (
        <TabList
          title="Documentos"
          addLabel="Documento"
          addHref={newHref("vault", here, { project_id: project.id })}
          empty="Sin documentos enlazados."
        >
          {documents.map((d) => (
            <Row
              key={d.id}
              href={editHref("vault", d.id, here)}
              icon={FileText}
              title={d.title}
              detail={
                d.expires_on
                  ? `vence ${relativeDay(d.expires_on, today)}`
                  : d.date
                    ? formatShort(d.date)
                    : undefined
              }
              actions={
                <RowActions
                  kind="vault"
                  id={d.id}
                  label={d.title}
                  editHref={editHref("vault", d.id, here)}
                />
              }
            />
          ))}
        </TabList>
      ) : null}

      {tab === "notas" ? (
        <section aria-labelledby="notes-title" className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2
              id="notes-title"
              className="text-lg font-semibold tracking-[-0.015em]"
            >
              Notas
            </h2>
            <HeaderLink
              icon={Pencil}
              href={editHref("project", project.id, here)}
            >
              Editar notas
            </HeaderLink>
          </div>
          <div className="rounded-2xl bg-surface p-5">
            {project.notes ? (
              <p className="text-[0.9375rem] whitespace-pre-line text-fg">
                {project.notes}
              </p>
            ) : (
              <p className="text-sm text-fg-muted">Sin notas todavía.</p>
            )}
          </div>
        </section>
      ) : null}

      {tab === "info" ? (
        <section aria-labelledby="info-title" className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2
              id="info-title"
              className="text-lg font-semibold tracking-[-0.015em]"
            >
              Información
            </h2>
            <HeaderLink
              icon={Pencil}
              href={editHref("project", project.id, here)}
            >
              Editar
            </HeaderLink>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-2xl bg-line-soft sm:grid-cols-2">
            {[
              ["Estado", projectStatusLabel[project.status]],
              ["Prioridad", priorityLabel[project.priority]],
              [
                "Inicio",
                project.start_date ? formatWithYear(project.start_date) : "—",
              ],
              [
                "Fecha objetivo",
                project.target_date ? formatWithYear(project.target_date) : "—",
              ],
              ["Enlace", project.url ?? "—"],
              ["En una frase", project.description ?? "—"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-0.5 bg-surface px-5 py-3"
              >
                <dt className="text-xs font-semibold text-fg-subtle">
                  {label}
                </dt>
                <dd className="text-[0.9375rem] break-words text-fg">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}

/** One tab of the project file: a title, an add button and a list. */
function TabList({
  title,
  note,
  addLabel,
  addHref,
  empty,
  children,
}: {
  title: string;
  note?: string;
  addLabel: string;
  addHref: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.015em]">{title}</h2>
          {note ? <p className="text-sm text-fg-muted">{note}</p> : null}
        </div>
        <HeaderLink icon={Plus} href={addHref}>
          {addLabel}
        </HeaderLink>
      </div>
      {children.length ? (
        <RowList>{children}</RowList>
      ) : (
        <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
          {empty}
        </p>
      )}
    </section>
  );
}
