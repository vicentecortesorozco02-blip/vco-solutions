import { ArrowLeft, Pencil, Receipt, Repeat, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SubscriptionStatusButton } from "@/components/panel/Actions";
import { Amount, Card, CardTitle, HeaderLink, PageHeader, PaymentStateChip, Pill } from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { formatShort, relativeDay } from "@/lib/life/dates";
import { chargeDate, chargeHistory, nextChargeView, priceHistory } from "@/lib/life/finance";
import { editHref, newHref } from "@/lib/life/links";
import { formatMoney } from "@/lib/life/money";
import {
  accountChangeLabel,
  chargeKindLabel,
  chargeStatusLabel,
  confidenceLabel,
  frequencyLabel,
  scopeLabel,
  subscriptionCategoryLabel,
  subscriptionStatusLabel,
  taxLabel,
} from "@/lib/life/model";
import { monthlyCost, yearlyCost } from "@/lib/life/recurrence";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Suscripción" };

/** The whole story of one service: what it costs, what it charged, and what is still to confirm. */
export default async function SubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { today } = await requirePanelSession();
  const { id } = await params;
  const data = await loadLifeData();
  const sub = data.subscriptions.find((s) => s.id === id);
  if (!sub) notFound();

  const here = `${panelRoutes.subscriptions}/${sub.id}`;
  const next = nextChargeView(sub, today);
  const prices = priceHistory(data.prices, sub.id);
  const charges = chargeHistory(data.charges, sub.id);
  const monthly = monthlyCost(sub);
  const yearly = yearlyCost(sub);
  const project = sub.project_id ? data.projects.find((p) => p.id === sub.project_id) : null;
  const accountName = new Map(data.accounts.map((a) => [a.id, a.name]));

  const facts: { label: string; value: React.ReactNode }[] = [
    { label: "Importe", value: <Amount value={sub.amount === null ? null : Number(sub.amount)} confidence={sub.amount_status} /> },
    { label: "El importe es", value: confidenceLabel[sub.amount_status] },
    { label: "Vigente desde", value: sub.amount_as_of ? formatShort(sub.amount_as_of) : "Pendiente de confirmar" },
    { label: "Impuestos", value: taxLabel[sub.tax] },
    { label: "Frecuencia", value: frequencyLabel[sub.frequency] + (sub.frequency === "custom" && sub.custom_days ? ` · cada ${sub.custom_days} días` : "") },
    {
      label: "Próximo cobro",
      value: next.date
        ? `${formatShort(next.date)} · ${relativeDay(next.date, today)}`
        : sub.next_charge_date
          ? `Falta la frecuencia · último conocido el ${formatShort(sub.next_charge_date)}`
          : "Pendiente de confirmar",
    },
    { label: "La fecha es", value: confidenceLabel[sub.date_status] },
    { label: "Coste mensual comparable", value: monthly === null ? "No se puede calcular" : formatMoney(monthly) },
    { label: "Coste anual comparable", value: yearly === null ? "No se puede calcular" : formatMoney(yearly) },
    { label: "Categoría", value: subscriptionCategoryLabel[sub.category] },
    { label: "Tipo de gasto", value: project ? `${scopeLabel[sub.scope]} · ${project.name}` : scopeLabel[sub.scope] },
    { label: "Se cobra en", value: sub.observed_account_id ? accountName.get(sub.observed_account_id) ?? "—" : "Pendiente de confirmar" },
    { label: "Debería cobrarse en", value: sub.target_account_id ? accountName.get(sub.target_account_id) ?? "—" : "Sin decidir" },
    { label: "Cambio de cuenta", value: accountChangeLabel[sub.account_change] },
    { label: "Aparece en el banco como", value: sub.merchant ?? "—" },
    { label: "Permanencia", value: sub.commitment ?? "Sin permanencia conocida" },
    { label: "La permanencia acaba", value: sub.commitment_until ? formatShort(sub.commitment_until) : "Pendiente de confirmar" },
    { label: "De dónde sale el dato", value: sub.source ?? "—" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={panelRoutes.subscriptions}
          className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
          Suscripciones
        </Link>
      </div>

      <PageHeader
        title={sub.name}
        question={[sub.company, subscriptionStatusLabel[sub.status]].filter(Boolean).join(" · ")}
        actions={
          <>
            <HeaderLink icon={Receipt} href={newHref("charge", here, { subscription_id: sub.id, description: sub.name })}>
              Apuntar un cargo
            </HeaderLink>
            <SubscriptionStatusButton id={sub.id} status={sub.status} />
            <HeaderLink primary icon={Pencil} href={editHref("subscription", sub.id, here)}>
              Editar
            </HeaderLink>
          </>
        }
      />

      <Card aria-labelledby="facts-title">
        <CardTitle icon={Repeat}>
          <span id="facts-title">La ficha</span>
        </CardTitle>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-2">
              <dt className="text-sm text-fg-muted">{fact.label}</dt>
              <dd className="text-right text-[0.9375rem] text-fg">{fact.value}</dd>
            </div>
          ))}
        </dl>
        {sub.notes ? <p className="mt-5 text-sm whitespace-pre-line text-fg-muted">{sub.notes}</p> : null}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card aria-labelledby="prices-title">
          <CardTitle icon={TrendingUp}>
            <span id="prices-title">Historial de precios</span>
          </CardTitle>
          {prices.length ? (
            <ul className="flex flex-col gap-3">
              {prices.map((price) => (
                <li key={price.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-[0.9375rem] text-fg">
                    {price.effective_on ? formatShort(price.effective_on) : "Sin fecha"}
                    <span className="ml-2 text-sm text-fg-subtle">{confidenceLabel[price.status]}</span>
                  </span>
                  <span className="tnum font-semibold text-fg">{formatMoney(Number(price.amount))}</span>
                  {price.notes ? <span className="w-full text-sm text-fg-muted">{price.notes}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-fg-muted">Sin precios anteriores guardados.</p>
          )}
          <p className="mt-4 text-sm text-fg-muted">Los precios antiguos se guardan y no sustituyen al vigente.</p>
        </Card>

        <Card aria-labelledby="history-title">
          <CardTitle icon={Receipt}>
            <span id="history-title">Historial de cargos</span>
          </CardTitle>
          {charges.length ? (
            <ul className="flex flex-col gap-3">
              {charges.map((charge) => (
                <li key={charge.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <Link href={editHref("charge", charge.id, here)} scroll={false} className="flex min-h-10 min-w-0 flex-1 flex-col justify-center">
                    <span className="truncate text-[0.9375rem] font-medium text-fg">
                      {charge.description || chargeKindLabel[charge.kind]}
                    </span>
                    <span className="text-sm text-fg-muted">
                      {[
                        chargeDate(charge) ? formatShort(chargeDate(charge)!) : "sin fecha",
                        charge.value_date && charge.value_date !== charge.operation_date ? `valor ${formatShort(charge.value_date)}` : null,
                        charge.booking_date ? `contabilizado ${formatShort(charge.booking_date)}` : null,
                        charge.period_label ? `cuota ${charge.period_label}` : null,
                        charge.account_id ? accountName.get(charge.account_id) : null,
                        // "PayPal · PayPal" no dice nada: el medio solo aparece
                        // cuando no es ya el nombre de la cuenta.
                        charge.channel && charge.channel !== (charge.account_id ? accountName.get(charge.account_id) : null)
                          ? charge.channel
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </Link>
                  <span className="flex items-center gap-2">
                    {charge.candidate_subscription_id === sub.id && charge.subscription_id !== sub.id ? (
                      <Pill tone="caution">Sin confirmar</Pill>
                    ) : charge.status !== "paid" ? (
                      <PaymentStateChip
                        state={charge.status === "failed" ? "failed" : charge.status === "pending" ? "pending" : "cancelled"}
                      />
                    ) : null}
                    <span className="tnum font-semibold text-fg">{formatMoney(Number(charge.amount))}</span>
                  </span>
                  {charge.status !== "paid" ? (
                    <span className="w-full text-xs text-fg-muted">
                      {chargeStatusLabel[charge.status]}: no cuenta como gasto.
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-fg-muted">Todavía no hay cargos apuntados de esta suscripción.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
