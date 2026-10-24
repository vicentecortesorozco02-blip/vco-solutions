import { Globe, Plus, Receipt } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState, HeaderLink, PageHeader, Pill, Row, RowList, StatCard } from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { countdown, diffDays, formatWithYear } from "@/lib/life/dates";
import { editHref, newHref } from "@/lib/life/links";
import { formatMoney } from "@/lib/life/money";
import type { Domain } from "@/lib/life/model";
import { chargeDate, isSpend } from "@/lib/life/finance";
import { colorOf } from "@/lib/life/partners";
import { domainLevel } from "@/lib/life/reminders";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Dominios" };

/** ¿Qué dominio renueva pronto? Avisa a 30, 15 y 7 días. */
export default async function DomainsPage() {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();
  const projectName = new Map(data.projects.map((p) => [p.id, p.name]));

  const sorted = [...data.domains].sort((a, b) => (a.renews_on ?? "9999").localeCompare(b.renews_on ?? "9999"));
  const soon = sorted.filter((d) => d.renews_on && domainLevel(diffDays(today, d.renews_on)) !== null);
  const yearly = data.domains.reduce((sum, d) => sum + Number(d.cost ?? 0), 0);
  const withoutCost = data.domains.filter((d) => d.cost === null).length;

  // Lo pagado de verdad: cargos apuntados a cada dominio.
  const paidFor = (id: string) => data.charges.filter((c) => c.domain_id === id && isSpend(c));
  const paidTotal = data.charges.filter((c) => c.domain_id !== null && isSpend(c)).reduce((sum, c) => sum + Number(c.amount), 0);
  const paidPayments = data.charges.filter((c) => c.domain_id !== null && isSpend(c)).length;
  const accountName = new Map(data.accounts.map((a) => [a.id, a.name]));

  const row = (domain: Domain) => {
    const days = domain.renews_on ? diffDays(today, domain.renews_on) : null;
    const level = days !== null ? domainLevel(days) : null;
    const payments = paidFor(domain.id);
    const paid = payments.reduce((sum, c) => sum + Number(c.amount), 0);
    const last = payments[0];
    return (
      <Row
        key={domain.id}
        href={editHref("domain", domain.id, panelRoutes.domains)}
        icon={Globe}
        iconColor={domain.project_id ? colorOf(data.projects, domain.project_id) : undefined}
        title={domain.domain}
        detail={[
          domain.cost === null ? "precio sin confirmar" : `${formatMoney(Number(domain.cost))} al año`,
          domain.renews_on ? `renueva el ${formatWithYear(domain.renews_on)}` : "sin fecha de renovación",
          payments.length
            ? `${formatMoney(paid)} pagados${last && chargeDate(last) ? ` · último el ${formatWithYear(chargeDate(last)!)}` : ""}`
            : "sin pagos apuntados",
          domain.provider,
          domain.account_id ? accountName.get(domain.account_id) : null,
          domain.project_id ? projectName.get(domain.project_id) : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        trailing={
          <>
            {domain.auto_renew ? <Pill>Automática</Pill> : null}
            {level && domain.renews_on ? (
              <Pill tone={level === "critical" ? "critical" : level === "soon" ? "caution" : "accent"}>
                {days! < 0 ? "Caducado" : countdown(domain.renews_on, today)}
              </Pill>
            ) : null}
            <span className="tnum text-sm font-semibold text-fg">
              {payments.length ? formatMoney(paid) : <span className="font-normal text-fg-muted">—</span>}
            </span>
          </>
        }
      />
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dominios"
        question="¿Qué renueva pronto y qué ha costado?"
        actions={
          <>
            <HeaderLink icon={Receipt} href={newHref("charge", panelRoutes.domains, { description: "Dominio" })}>
              Apuntar un pago
            </HeaderLink>
            <HeaderLink primary icon={Plus} href={newHref("domain", panelRoutes.domains)}>
              Nuevo dominio
            </HeaderLink>
          </>
        }
      />

      {data.domains.length === 0 ? (
        <EmptyState icon={Globe} title="Ningún dominio registrado">
          Apunta cada dominio con su fecha de renovación: te avisaremos a 30, 15 y 7 días.
        </EmptyState>
      ) : (
        <>
          <section aria-label="Resumen" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Dominios" value={data.domains.length} />
            <StatCard
              label="Renuevan pronto"
              value={soon.length}
              detail="en 30 días o menos"
              tone={soon.length ? "critical" : "default"}
            />
            <StatCard
              label="Coste anual"
              value={yearly > 0 ? formatMoney(yearly) : "Pendiente de confirmar"}
              detail={
                withoutCost
                  ? `${withoutCost} ${withoutCost === 1 ? "dominio" : "dominios"} sin precio confirmado`
                  : `${formatMoney(yearly / 12)} al mes`
              }
            />
            <StatCard
              label="Pagado hasta hoy"
              value={paidTotal > 0 ? formatMoney(paidTotal) : "Sin pagos"}
              detail={
                paidPayments === 0
                  ? "apunta lo que costó cada uno"
                  : `${paidPayments} ${paidPayments === 1 ? "pago apuntado" : "pagos apuntados"}`
              }
            />
          </section>

          <section aria-labelledby="all-title" className="flex flex-col gap-3">
            <h2 id="all-title" className="px-1 text-lg font-semibold tracking-[-0.015em]">
              Todos los dominios
            </h2>
            <RowList>{sorted.map(row)}</RowList>
            <p className="px-1 text-sm text-fg-muted">
              Ordenados por fecha de renovación. La cifra de la derecha es lo pagado por ese dominio; toca uno para ver
              su ficha o apuntar un pago.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
