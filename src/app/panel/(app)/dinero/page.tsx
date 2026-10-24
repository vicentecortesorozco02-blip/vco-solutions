import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Landmark,
  Plus,
  Receipt,
  Repeat,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { MarkPaidButton } from "@/components/panel/Actions";
import {
  Amount,
  Card,
  CardTitle,
  EmptyState,
  HeaderLink,
  PageHeader,
  PaymentStateChip,
  Pill,
  Row,
  RowList,
  StatCard,
  TotalLine,
  TotalValue,
} from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";
import { addMonths, endOfMonth, formatMonth, formatShort, relativeDay, startOfMonth } from "@/lib/life/dates";
import {
  accountChangesPending,
  awaitingPayment,
  cancelPending,
  chargeDate,
  monthlyByScope,
  pendingConfirmations,
  recurringMonthly,
  spentByAccount,
  toReview,
  totalSum,
  unidentified,
  upcoming,
  upcomingTotal,
} from "@/lib/life/finance";
import { editHref, newHref } from "@/lib/life/links";
import { formatMoney, monthSummary, spentByMonth } from "@/lib/life/money";
import { accountKindLabel, chargeStatusLabel, moneyCategoryLabel, subscriptionStatusLabel } from "@/lib/life/model";
import { monthlyCost } from "@/lib/life/recurrence";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Dinero" };

/** ¿Dónde estoy gastando? */
export default async function MoneyPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();
  const { mes } = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(mes ?? "") ? `${mes}-01` : startOfMonth(today);
  const isCurrent = month === startOfMonth(today);
  const here = isCurrent ? panelRoutes.money : `${panelRoutes.money}?mes=${month.slice(0, 7)}`;
  const monthUrl = (iso: string) =>
    iso === startOfMonth(today) ? panelRoutes.money : `${panelRoutes.money}?mes=${iso.slice(0, 7)}`;

  // What happened this month, from charges and typed movements. Never mixed
  // with forecasts: those live in "Lo que viene".
  const summary = monthSummary(data.transactions, data.subscriptions, month);
  const charged = spentByMonth(data.charges, month);
  const spent = summary.spent + charged;

  const next30 = upcoming(data, today, 30);
  const next30Total = upcomingTotal(next30);
  const recurring = recurringMonthly(data.subscriptions);
  const scopes = monthlyByScope(data.subscriptions, data.projects);
  const pending = pendingConfirmations(data.subscriptions, data.domains);

  const unknown = unidentified(data.charges);
  const invoices = awaitingPayment(data.charges);
  const review = toReview(data.subscriptions);
  const toCancel = cancelPending(data.subscriptions);
  const changes = accountChangesPending(data.subscriptions);
  const accounts = spentByAccount(data.charges, data.accounts, startOfMonth(month), endOfMonth(month));

  const planned = data.transactions
    .filter((t) => t.planned && t.kind === "expense")
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const movements = data.transactions.filter((t) => !t.planned && t.date >= month && t.date <= endOfMonth(month));
  const monthCharges = data.charges
    .filter((c) => {
      const date = chargeDate(c);
      return date !== null && date >= month && date <= endOfMonth(month);
    })
    .sort((a, b) => ((chargeDate(a) ?? "") < (chargeDate(b) ?? "") ? 1 : -1));

  const subscriptionName = new Map(data.subscriptions.map((s) => [s.id, s.name]));
  const accountName = new Map(data.accounts.map((a) => [a.id, a.name]));
  const target = data.accounts.find((a) => a.is_target);

  // Una tarjeta por cuenta, más una para lo que todavía no tiene cuenta.
  const live = data.subscriptions.filter((s) => s.status !== "cancelled");
  const cardFor = (id: string | null) => {
    const subs = live.filter((s) => s.observed_account_id === id);
    const costs = subs.map(monthlyCost);
    return {
      subs,
      monthly: costs.reduce((sum: number, cost) => sum + (cost ?? 0), 0),
      unknown: costs.filter((cost) => cost === null).length,
    };
  };
  const accountCards = [
    ...data.accounts.map((account) => ({ account, ...cardFor(account.id) })),
    ...(live.some((s) => s.observed_account_id === null)
      ? [
          {
            account: {
              id: null as string | null,
              name: "Sin cuenta asignada",
              institution: null,
              kind: null,
              has_card: false,
              is_target: false,
            },
            ...cardFor(null),
          },
        ]
      : []),
  ];
  const empty = data.charges.length + data.transactions.length + data.subscriptions.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dinero"
        question="¿Qué pago, cuánto, desde qué cuenta y cuándo?"
        actions={
          <>
            <HeaderLink icon={Receipt} href={newHref("charge", here)}>
              Cargo
            </HeaderLink>
            <HeaderLink icon={Landmark} href={newHref("account", here)}>
              Cuenta
            </HeaderLink>
            <HeaderLink primary icon={Plus} href={newHref("transaction", here, { kind: "expense" })}>
              Gasto
            </HeaderLink>
          </>
        }
      />

      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Gastado este mes" value={formatMoney(spent)} detail="cargos y gastos ya pagados" />
        <StatCard label="Lo que viene" value={<TotalValue total={next30Total} />} detail="próximos 30 días" />
        <StatCard label="Suscripciones" value={<TotalValue total={recurring} />} detail="al mes, de media" />
        <StatCard
          label="Personal"
          value={formatMoney(totalSum(scopes.personal))}
          detail={scopes.personal.unknown ? `al mes · ${scopes.personal.unknown} sin importe` : "al mes"}
        />
        <StatCard
          label="De proyectos"
          value={formatMoney(scopes.byProject.reduce((sum, row) => sum + totalSum(row.total), 0))}
          detail={(() => {
            const unknown = scopes.byProject.reduce((count, row) => count + row.total.unknown, 0);
            if (unknown) return `al mes · ${unknown} por consumo, sin importe fijo`;
            return totalSum(scopes.pending) > 0 ? `${formatMoney(totalSum(scopes.pending))} sin clasificar` : "al mes";
          })()}
        />
      </section>

      <section aria-labelledby="accounts-title" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 id="accounts-title" className="text-lg font-semibold tracking-[-0.015em]">
            Tus cuentas
          </h2>
          <p className="text-sm text-fg-muted">Qué se cobra en cada una</p>
        </div>
        {data.accounts.length === 0 ? (
          <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
            Añade tus cuentas y tarjetas para saber de dónde sale cada cobro.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {accountCards.map(({ account, subs, monthly, unknown }) => (
              <Card key={account.id ?? "sin"} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[0.9375rem] font-semibold text-fg">{account.name}</span>
                    <span className="truncate text-sm text-fg-muted">
                      {[
                        account.institution,
                        account.kind ? accountKindLabel[account.kind] : null,
                        account.has_card ? "con tarjeta" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  {account.is_target ? <Pill tone="accent">Cuenta elegida</Pill> : null}
                </div>

                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-fg-muted">Al mes</span>
                  <span className="tnum text-lg font-semibold text-fg">
                    {formatMoney(monthly)}
                    {unknown ? <span className="ml-2 text-xs font-normal text-fg-subtle">+{unknown} sin importe</span> : null}
                  </span>
                </div>

                {subs.length ? (
                  <ul className="flex flex-col gap-1.5 border-t border-line-soft pt-3">
                    {subs.map((sub) => (
                      <li key={sub.id} className="flex items-baseline justify-between gap-3 text-sm">
                        <Link href={panelRoutes.subscription(sub.id)} className="truncate text-fg hover:underline">
                          {sub.name}
                        </Link>
                        <span className="tnum shrink-0 text-fg-muted">
                          {sub.amount === null ? "sin importe" : formatMoney(Number(sub.amount))}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="border-t border-line-soft pt-3 text-sm text-fg-muted">
                    Ninguna suscripción apuntada a esta cuenta.
                  </p>
                )}

                {account.id ? (
                  <Link
                    href={editHref("account", account.id, here)}
                    scroll={false}
                    className="text-sm font-medium text-accent-text hover:underline"
                  >
                    Editar cuenta
                  </Link>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>

      {empty ? (
        <EmptyState icon={Wallet} title="Aún no hay nada apuntado">
          Apunta un cargo del banco o una suscripción y esta pantalla empieza a contarte dónde se va el dinero.
        </EmptyState>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card aria-labelledby="upcoming-title">
          <CardTitle icon={CreditCard}>
            <span id="upcoming-title">Lo que viene</span>
          </CardTitle>
          {next30.length ? (
            <ul className="flex flex-col gap-2">
              {next30.slice(0, 10).map((payment) => (
                <li key={payment.key} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <Link
                    href={
                      payment.chargeId
                        ? editHref("charge", payment.chargeId, here)
                        : payment.subscriptionId
                          ? editHref("subscription", payment.subscriptionId, here)
                          : here
                    }
                    scroll={false}
                    className="flex min-h-10 min-w-0 flex-1 flex-col justify-center"
                  >
                    <span className="truncate text-[0.9375rem] font-medium text-fg">{payment.name}</span>
                    <span className="text-sm text-fg-muted">
                      {relativeDay(payment.date, today)}
                      {payment.accountId ? ` · ${accountName.get(payment.accountId) ?? ""}` : ""}
                    </span>
                  </Link>
                  <Amount value={payment.amount} confidence={payment.confidence} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-fg-muted">
              Nada previsto en 30 días. Las suscripciones por consumo o sin fecha confirmada no generan previsiones.
            </p>
          )}
          <p className="mt-4 text-sm text-fg-muted">
            {next30Total.confirmed > 0 ? `${formatMoney(next30Total.confirmed)} confirmados` : "Sin importes confirmados"}
            {next30Total.estimated > 0 ? ` · ${formatMoney(next30Total.estimated)} estimados` : ""}
            {next30Total.unknown > 0 ? ` · ${next30Total.unknown} sin importe` : ""}
          </p>
        </Card>

        <Card aria-labelledby="scope-title">
          <CardTitle icon={Repeat} href={panelRoutes.subscriptions}>
            <span id="scope-title">Gasto fijo por proyecto</span>
          </CardTitle>
          <ul className="flex flex-col gap-3">
            <li className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
              <span className="text-fg">Personal</span>
              <TotalLine total={scopes.personal} />
            </li>
            {scopes.byProject.map((row) => (
              <li key={row.project?.id ?? "sin"} className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
                <Link
                  href={row.project ? `${panelRoutes.projects}/${row.project.id}` : panelRoutes.projects}
                  className="truncate text-fg hover:underline"
                >
                  {row.project?.name ?? "Proyecto"}
                </Link>
                <TotalLine total={row.total} />
              </li>
            ))}
            {totalSum(scopes.pending) > 0 || scopes.pending.unknown > 0 ? (
              <li className="flex items-baseline justify-between gap-3 border-t border-line-soft pt-3 text-[0.9375rem]">
                <span className="text-fg-muted">Sin clasificar</span>
                <TotalLine total={scopes.pending} />
              </li>
            ) : null}
          </ul>
          <p className="mt-4 text-sm text-fg-muted">
            Solo se asigna a un proyecto lo que está acreditado. El resto queda sin clasificar a propósito.
          </p>
        </Card>
      </div>

      {unknown.length || invoices.length || review.length || toCancel.length || changes.length ? (
        <section aria-labelledby="pending-title" className="flex flex-col gap-3">
          <h2 id="pending-title" className="px-1 text-lg font-semibold tracking-[-0.015em]">
            Pendiente de resolver
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {unknown.length ? (
              <Card aria-labelledby="unknown-title">
                <CardTitle icon={CircleHelp}>
                  <span id="unknown-title">Cargos sin identificar</span>
                </CardTitle>
                <ul className="flex flex-col gap-2">
                  {unknown.map((charge) => (
                    <li key={charge.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <Link href={editHref("charge", charge.id, here)} scroll={false} className="flex min-h-10 min-w-0 flex-1 flex-col justify-center">
                        <span className="truncate text-[0.9375rem] font-medium text-fg">
                          {charge.description || charge.merchant || "Cargo"}
                        </span>
                        <span className="text-sm text-fg-muted">
                          {[
                            chargeDate(charge) ? formatShort(chargeDate(charge)!) : "sin fecha",
                            charge.account_id ? accountName.get(charge.account_id) : null,
                            charge.candidate_subscription_id
                              ? `¿${subscriptionName.get(charge.candidate_subscription_id)}?`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </Link>
                      <span className="tnum font-semibold text-fg">{formatMoney(Number(charge.amount))}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {invoices.length ? (
              <Card aria-labelledby="invoices-title">
                <CardTitle icon={Receipt}>
                  <span id="invoices-title">Facturas pendientes de pago</span>
                </CardTitle>
                <ul className="flex flex-col gap-2">
                  {invoices.map((charge) => (
                    <li key={charge.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <Link href={editHref("charge", charge.id, here)} scroll={false} className="flex min-h-10 min-w-0 flex-1 flex-col justify-center">
                        <span className="truncate text-[0.9375rem] font-medium text-fg">
                          {charge.description || "Factura"}
                        </span>
                        <span className="text-sm text-fg-muted">
                          {charge.reported_on ? `Comunicada el ${formatShort(charge.reported_on)}` : "Sin fecha"}
                        </span>
                      </Link>
                      <span className="tnum font-semibold text-fg">{formatMoney(Number(charge.amount))}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-fg-muted">
                  Lo que te comunicaron en su día. Que siga pendiente hoy hay que comprobarlo.
                </p>
              </Card>
            ) : null}

            {review.length || toCancel.length ? (
              <Card aria-labelledby="review-title">
                <CardTitle icon={Repeat}>
                  <span id="review-title">Suscripciones por revisar</span>
                </CardTitle>
                <ul className="flex flex-col gap-2">
                  {[...toCancel, ...review].map((sub) => (
                    <li key={sub.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <Link href={editHref("subscription", sub.id, here)} scroll={false} className="flex min-h-10 min-w-0 flex-1 flex-col justify-center">
                        <span className="truncate text-[0.9375rem] font-medium text-fg">{sub.name}</span>
                        <span className="text-sm text-fg-muted">{subscriptionStatusLabel[sub.status]}</span>
                      </Link>
                      <Amount value={sub.amount === null ? null : Number(sub.amount)} confidence={sub.amount_status} />
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {changes.length ? (
              <Card aria-labelledby="changes-title">
                <CardTitle icon={Landmark}>
                  <span id="changes-title">Cambios de cuenta pendientes</span>
                </CardTitle>
                <ul className="flex flex-col gap-2">
                  {changes.map((sub) => (
                    <li key={sub.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <Link href={editHref("subscription", sub.id, here)} scroll={false} className="flex min-h-10 min-w-0 flex-1 flex-col justify-center">
                        <span className="truncate text-[0.9375rem] font-medium text-fg">{sub.name}</span>
                        <span className="text-sm text-fg-muted">
                          {sub.observed_account_id ? accountName.get(sub.observed_account_id) : "Cuenta sin confirmar"} →{" "}
                          {sub.target_account_id ? accountName.get(sub.target_account_id) : target?.name ?? "cuenta destino"}
                        </span>
                      </Link>
                      <Pill tone="caution">Pendiente</Pill>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-fg-muted">
                  Marcar el cambio como confirmado en cada ficha cuando el cobro ya se vea en la cuenta buena.
                </p>
              </Card>
            ) : null}
          </div>
          <p className="px-1 text-sm text-fg-muted">
            Faltan por confirmar: {pending.amounts} importes, {pending.estimatedAmounts} estimaciones, {pending.dates}{" "}
            fechas de cobro, {pending.taxes} veces los impuestos y {pending.domainDates} renovaciones de dominios.
          </p>
        </section>
      ) : null}

      <div className="flex items-center gap-1">
        <Link
          href={monthUrl(addMonths(month, -1))}
          aria-label="Mes anterior"
          className="grid size-10 place-items-center rounded-full bg-surface hover:bg-surface-raised"
        >
          <ChevronLeft className="size-5" strokeWidth={2} aria-hidden />
        </Link>
        <Link
          href={monthUrl(addMonths(month, 1))}
          aria-label="Mes siguiente"
          className="grid size-10 place-items-center rounded-full bg-surface hover:bg-surface-raised"
        >
          <ChevronRight className="size-5" strokeWidth={2} aria-hidden />
        </Link>
        <h2 className="ml-2 text-lg font-semibold tracking-[-0.015em] first-letter:uppercase">{formatMonth(month)}</h2>
      </div>

      {accounts.length ? (
        <Card aria-labelledby="accounts-title">
          <CardTitle icon={Landmark}>
            <span id="accounts-title">Pagado desde cada cuenta este mes</span>
          </CardTitle>
          <ul className="flex flex-col gap-3">
            {accounts.map(({ account, amount }) => (
              <li key={account.id} className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
                <Link href={editHref("account", account.id, here)} scroll={false} className="truncate text-fg hover:underline">
                  {account.name}
                  {account.is_target ? <span className="ml-2 text-xs text-fg-subtle">cuenta elegida</span> : null}
                </Link>
                <span className="tnum font-semibold text-fg">{formatMoney(amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {planned.length ? (
        <section aria-labelledby="planned-title" className="flex flex-col gap-3">
          <h2 id="planned-title" className="px-1 text-lg font-semibold tracking-[-0.015em]">
            Pagos previstos apuntados a mano
          </h2>
          <RowList>
            {planned.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 sm:px-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fill text-fg-muted">
                  <CreditCard className="size-[1.125rem]" strokeWidth={1.75} aria-hidden />
                </span>
                <Link
                  href={editHref("transaction", t.id, here)}
                  scroll={false}
                  className="flex min-h-14 min-w-0 flex-1 flex-col justify-center border-b border-line-soft py-3"
                >
                  <span className="truncate text-[0.9375rem] font-medium text-fg">{t.description || "Pago previsto"}</span>
                  <span className={cn("text-sm", t.date < today ? "text-caution" : "text-fg-muted")}>
                    {relativeDay(t.date, today)} · {moneyCategoryLabel[t.category]}
                    {t.date < today ? " · pendiente de comprobar" : ""}
                  </span>
                </Link>
                <span className="tnum text-[0.9375rem] font-semibold text-fg">{formatMoney(Number(t.amount))}</span>
                <MarkPaidButton id={t.id} />
              </li>
            ))}
          </RowList>
        </section>
      ) : null}

      <section aria-labelledby="charges-title" className="flex flex-col gap-3">
        <h2 id="charges-title" className="px-1 text-lg font-semibold tracking-[-0.015em]">
          Cargos del mes
        </h2>
        {monthCharges.length ? (
          <RowList>
            {monthCharges.map((charge) => (
              <Row
                key={charge.id}
                href={editHref("charge", charge.id, here)}
                icon={charge.kind === "bank_fee" ? Landmark : Receipt}
                title={charge.description || charge.merchant || "Cargo"}
                muted={charge.status !== "paid"}
                detail={[
                  chargeDate(charge) ? formatShort(chargeDate(charge)!) : "sin fecha",
                  charge.account_id ? accountName.get(charge.account_id) : null,
                  charge.period_label ? `cuota ${charge.period_label}` : null,
                  charge.status === "paid" ? null : chargeStatusLabel[charge.status],
                ]
                  .filter(Boolean)
                  .join(" · ")}
                trailing={
                  <span className="flex items-center gap-2">
                    {charge.status === "paid" ? null : <PaymentStateChip state={charge.status === "failed" ? "failed" : charge.status === "pending" ? "pending" : "cancelled"} />}
                    <span className="tnum text-[0.9375rem] font-semibold text-fg">{formatMoney(Number(charge.amount))}</span>
                  </span>
                }
              />
            ))}
          </RowList>
        ) : (
          <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">Sin cargos registrados este mes.</p>
        )}
        <p className="px-1 text-sm text-fg-muted">
          Las autorizaciones y los intentos rechazados se guardan, pero no suman: solo cuenta lo pagado.
        </p>
      </section>

      {movements.length ? (
        <section aria-labelledby="moves-title" className="flex flex-col gap-3">
          <h2 id="moves-title" className="px-1 text-lg font-semibold tracking-[-0.015em]">
            Movimientos apuntados a mano
          </h2>
          <RowList>
            {movements.map((t) => (
              <Row
                key={t.id}
                href={editHref("transaction", t.id, here)}
                icon={t.kind === "income" ? ArrowDownLeft : ArrowUpRight}
                title={t.description || moneyCategoryLabel[t.category]}
                detail={`${formatShort(t.date)} · ${moneyCategoryLabel[t.category]}`}
                trailing={
                  <span className={cn("tnum text-[0.9375rem] font-semibold", t.kind === "income" ? "text-positive" : "text-fg")}>
                    {t.kind === "income" ? "+" : "−"}
                    {formatMoney(Number(t.amount))}
                  </span>
                }
              />
            ))}
          </RowList>
        </section>
      ) : null}
    </div>
  );
}
