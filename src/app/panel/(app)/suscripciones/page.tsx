import { Plus, Repeat } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  Amount,
  EmptyState,
  HeaderLink,
  PageHeader,
  PaymentStateChip,
  Pill,
  Row,
  RowList,
  StatCard,
  TotalValue,
  ViewTabs,
} from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";
import { addDays, formatMonth, formatShort, formatWeekdayShort, relativeDay } from "@/lib/life/dates";
import {
  buildPaymentPlan,
  monthlyByScope,
  nextChargeView,
  recurringMonthly,
  totalSum,
  upcoming,
  upcomingTotal,
} from "@/lib/life/finance";
import { editHref, newHref } from "@/lib/life/links";
import { formatMoney, subscriptionTotals } from "@/lib/life/money";
import {
  confidenceShort,
  frequencyLabel,
  subscriptionCategoryLabel,
  subscriptionStatusLabel,
  type SubscriptionStatus,
} from "@/lib/life/model";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Suscripciones" };

/**
 * One-tap starters for the usual suspects. Only the name, kind and website
 * are filled in: the amount and the date are always the user's.
 */
const starters = [
  { name: "Supabase", category: "hosting", url: "https://supabase.com/dashboard" },
  { name: "Vercel", category: "hosting", url: "https://vercel.com/dashboard" },
  { name: "Claude", category: "ai", url: "https://claude.ai/settings" },
  { name: "ChatGPT", category: "ai", url: "https://chatgpt.com/" },
  { name: "GitHub", category: "software", url: "https://github.com/settings" },
  { name: "Correo profesional", category: "email" },
  { name: "Dominio", category: "domains" },
  { name: "Gimnasio", category: "gym" },
  { name: "Teléfono", category: "phone" },
  { name: "Seguro", category: "insurance", frequency: "annual" },
];

/** The order the lists appear in: what needs attention first. */
const groups: { status: SubscriptionStatus; note: string }[] = [
  { status: "active", note: "En marcha" },
  { status: "review", note: "Hay algo que confirmar" },
  { status: "cancel_pending", note: "Querías darlas de baja y no consta la baja" },
  { status: "cancelled", note: "Se guardan por el historial y no generan cobros" },
];

const views = ["mes", "lista"] as const;
type View = (typeof views)[number];

/** ¿Qué me van a cobrar? */
export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();
  const { vista } = await searchParams;
  const view: View = views.includes(vista as View) ? (vista as View) : "mes";
  const here = view === "mes" ? panelRoutes.subscriptions : `${panelRoutes.subscriptions}?vista=${view}`;

  const totals = subscriptionTotals(data.subscriptions);
  const monthly = recurringMonthly(data.subscriptions);
  const scopes = monthlyByScope(data.subscriptions, data.projects);
  const next30 = upcoming(data, today, 30);
  const next30Total = upcomingTotal(next30);

  const byStatus = (status: SubscriptionStatus) =>
    data.subscriptions
      .filter((s) => s.status === status)
      .map((sub) => ({ sub, next: nextChargeView(sub, today).date }))
      .sort((a, b) => (a.next ?? "9999").localeCompare(b.next ?? "9999"));

  // Ninety days of payments: the charges that happened and the forecasts.
  const plan = buildPaymentPlan(data, today, addDays(today, 89), today);
  const byMonth = new Map<string, typeof plan>();
  for (const payment of plan) {
    const month = payment.date.slice(0, 7);
    byMonth.set(month, [...(byMonth.get(month) ?? []), payment]);
  }

  const projectName = new Map(data.projects.map((p) => [p.id, p.name]));
  const accountName = new Map(data.accounts.map((a) => [a.id, a.name]));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Suscripciones"
        question="¿Qué me van a cobrar?"
        actions={
          <HeaderLink primary icon={Plus} href={newHref("subscription", here)}>
            Nueva suscripción
          </HeaderLink>
        }
      />

      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Gasto mensual" value={<TotalValue total={monthly} />} detail="media, anuales incluidas" />
        <StatCard
          label="Gasto anual"
          value={formatMoney(totals.yearly, { round: totals.yearly >= 1000 })}
          detail={totals.unknown ? `${totals.unknown} sin coste comparable` : "si nada cambia"}
        />
        <StatCard
          label="Próximos 30 días"
          value={<TotalValue total={next30Total} />}
          detail={`${next30.length} ${next30.length === 1 ? "cobro previsto" : "cobros previstos"}`}
        />
        <StatCard
          label="Activas"
          value={String(totals.active)}
          detail={`${formatMoney(totalSum(scopes.personal))} personal · ${formatMoney(
            scopes.byProject.reduce((sum, row) => sum + totalSum(row.total), 0),
          )} de proyectos`}
        />
      </section>

      {data.subscriptions.length === 0 ? (
        <div className="flex flex-col gap-4">
          <EmptyState icon={Repeat} title="Aún no hay suscripciones">
            Empieza por las que pagas cada mes. Toca una para rellenarla: solo tendrás que poner el importe y la fecha.
          </EmptyState>
          <Starters />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-6">
            {groups.map(({ status, note }) => {
              const rows = byStatus(status);
              if (!rows.length) return null;
              return (
                <section key={status} aria-labelledby={`subs-${status}`} className="flex flex-col gap-3">
                  <div className="px-1">
                    <h2 id={`subs-${status}`} className="text-lg font-semibold tracking-[-0.015em]">
                      {subscriptionStatusLabel[status]}
                      <span className="ml-2 text-sm font-normal text-fg-subtle">{rows.length}</span>
                    </h2>
                    <p className="text-sm text-fg-muted">{note}</p>
                  </div>
                  <RowList>
                    {rows.map(({ sub, next }) => (
                      <Row
                        key={sub.id}
                        href={panelRoutes.subscription(sub.id)}
                        icon={Repeat}
                        title={sub.name}
                        muted={status === "cancelled"}
                        detail={[
                          frequencyLabel[sub.frequency] +
                            (sub.frequency === "custom" && sub.custom_days ? ` · cada ${sub.custom_days} días` : ""),
                          next
                            ? `se renueva ${relativeDay(next, today)} · ${formatShort(next)}`
                            : sub.next_charge_date
                              ? `último cobro conocido el ${formatShort(sub.next_charge_date)} · falta la frecuencia`
                              : "falta la fecha del próximo cobro",
                          sub.scope === "project" && sub.project_id
                            ? projectName.get(sub.project_id)
                            : subscriptionCategoryLabel[sub.category],
                          sub.observed_account_id ? accountName.get(sub.observed_account_id) : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                        trailing={
                          <span className="flex items-center gap-2">
                            {/* El cambio de cuenta vive dentro de la ficha: aquí
                                solo lo que impide saber cuándo te cobran. */}
                            {!next && status !== "cancelled" ? (
                              <Pill tone="caution" className="hidden sm:inline-flex">
                                Falta la fecha
                              </Pill>
                            ) : null}
                            <Amount value={sub.amount === null ? null : Number(sub.amount)} confidence={sub.amount_status} />
                          </span>
                        }
                      />
                    ))}
                  </RowList>
                </section>
              );
            })}

            <details>
              <summary className="min-h-10 cursor-pointer px-1 text-sm font-medium text-accent-text">
                Añadir otra habitual
              </summary>
              <div className="pt-3">
                <Starters />
              </div>
            </details>
          </div>

          <section aria-labelledby="charges-title" className="flex min-w-0 flex-col gap-3">
            <h2 id="charges-title" className="px-1 text-lg font-semibold tracking-[-0.015em]">
              Calendario de pagos
            </h2>
            <ViewTabs
              label="Vista del calendario de pagos"
              current={view}
              tabs={[
                { key: "mes", label: "Por meses", href: panelRoutes.subscriptions },
                { key: "lista", label: "Lista", href: `${panelRoutes.subscriptions}?vista=lista` },
              ]}
            />
            {plan.length === 0 ? (
              <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
                Sin pagos previstos en los próximos 90 días. Las suscripciones por consumo o sin fecha confirmada no
                generan previsiones.
              </p>
            ) : view === "mes" ? (
              [...byMonth.entries()].map(([month, list]) => (
                <div key={month} className="rounded-2xl bg-surface p-4">
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="text-sm font-semibold text-fg first-letter:uppercase">{formatMonth(`${month}-01`)}</h3>
                    <span className="tnum text-sm font-semibold text-fg">
                      {formatMoney(list.reduce((sum, p) => sum + (p.amount ?? 0), 0))}
                    </span>
                  </div>
                  <ul className="flex flex-col">
                    {list.map((payment) => (
                      <PaymentRow key={payment.key} payment={payment} here={here} compact />
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <ul className="overflow-hidden rounded-2xl bg-surface p-2">
                {plan.map((payment) => (
                  <PaymentRow key={payment.key} payment={payment} here={here} />
                ))}
              </ul>
            )}
            <p className="px-1 text-sm text-fg-muted">
              Cada suscripción se renueva sola según su frecuencia: cuando pasa un cobro, la fecha avanza al siguiente.
              Una fecha pasada sin cargo registrado aparece como «pendiente de comprobar»: no se da por pagada ni por
              impagada.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

function PaymentRow({
  payment,
  here,
  compact = false,
}: {
  payment: ReturnType<typeof buildPaymentPlan>[number];
  here: string;
  compact?: boolean;
}) {
  const href = payment.chargeId
    ? editHref("charge", payment.chargeId, here)
    : payment.subscriptionId
      ? editHref("subscription", payment.subscriptionId, here)
      : here;
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-1 py-1.5 text-sm hover:bg-fill"
      >
        <span className="tnum w-16 shrink-0 text-fg-subtle">
          {formatWeekdayShort(payment.date)} {formatShort(payment.date).split(" ")[0]}
        </span>
        <span className={cn("min-w-0 flex-1 truncate font-medium", payment.state === "cancelled" ? "text-fg-muted" : "text-fg")}>
          {payment.name}
        </span>
        {compact ? null : <PaymentStateChip state={payment.state} />}
        <span className="tnum text-fg">
          {payment.amount === null ? (
            <span className="text-fg-muted">Sin importe</span>
          ) : (
            formatMoney(payment.amount)
          )}
        </span>
        {compact && payment.state !== "paid" && payment.state !== "forecast" ? (
          <span className="w-full text-xs text-fg-muted">{confidenceShort[payment.confidence]} · revisar</span>
        ) : null}
      </Link>
    </li>
  );
}

function Starters() {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Suscripciones habituales">
      {starters.map((starter) => (
        <li key={starter.name}>
          <Link
            href={newHref("subscription", panelRoutes.subscriptions, {
              name: starter.name,
              company: starter.url ? starter.name : undefined,
              category: starter.category,
              url: starter.url,
              frequency: starter.frequency,
            })}
            scroll={false}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-raised"
          >
            <Plus className="size-3.5 text-fg-subtle" strokeWidth={2.5} aria-hidden />
            {starter.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
