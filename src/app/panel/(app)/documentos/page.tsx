import { ArrowUpRight, FileText, Plus, StickyNote, Vault } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState, HeaderLink, PageHeader, Pill, ViewTabs } from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { countdown, diffDays, formatWithYear } from "@/lib/life/dates";
import { editHref, newHref } from "@/lib/life/links";
import { VAULT_CATEGORIES, type VaultCategory, vaultCategoryLabel } from "@/lib/life/model";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Documentos" };

/** Referencias importantes: dónde está cada cosa y cuándo caduca. */
export default async function VaultPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();
  const { categoria } = await searchParams;
  const filter = (VAULT_CATEGORIES as readonly string[]).includes(categoria ?? "") ? (categoria as VaultCategory) : "all";

  const present = VAULT_CATEGORIES.filter((c) => data.vault.some((v) => v.category === c));
  const items = data.vault
    .filter((v) => filter === "all" || v.category === filter)
    .sort((a, b) => (a.expires_on ?? "9999").localeCompare(b.expires_on ?? "9999") || b.created_at.localeCompare(a.created_at));
  const here = filter === "all" ? panelRoutes.documents : `${panelRoutes.documents}?categoria=${filter}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Documentos"
        question="¿Dónde guardé eso?"
        actions={
          <>
            <HeaderLink icon={StickyNote} href={newHref("vault", here, { category: "notes" })}>
              Nota
            </HeaderLink>
            <HeaderLink primary icon={Plus} href={newHref("vault", here, { category: filter === "all" ? undefined : filter })}>
              Nuevo
            </HeaderLink>
          </>
        }
      />

      {data.vault.length === 0 ? (
        <EmptyState icon={Vault} title="Aún no hay documentos">
          Guarda aquí el enlace a cada contrato, póliza o documento. Si tiene vencimiento, aparecerá en tus fechas.
        </EmptyState>
      ) : (
        <>
          {present.length > 1 ? (
            <ViewTabs
              label="Categorías"
              current={filter}
              tabs={[
                { key: "all", label: "Todo", href: panelRoutes.documents },
                ...present.map((c) => ({ key: c, label: vaultCategoryLabel[c], href: `${panelRoutes.documents}?categoria=${c}` })),
              ]}
            />
          ) : null}
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const days = item.expires_on ? diffDays(today, item.expires_on) : null;
              return (
                <li key={item.id} className="flex flex-col gap-3 rounded-2xl bg-surface p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={editHref("vault", item.id, here)} scroll={false} className="flex min-w-0 items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fill text-fg-muted">
                        {item.category === "notes" ? (
                          <StickyNote className="size-[1.125rem]" strokeWidth={1.75} aria-hidden />
                        ) : (
                          <FileText className="size-[1.125rem]" strokeWidth={1.75} aria-hidden />
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="text-[0.9375rem] font-semibold text-fg">{item.title}</span>
                        <span className="text-sm text-fg-muted">{vaultCategoryLabel[item.category]}</span>
                      </span>
                    </Link>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Abrir ${item.title}`}
                        className="grid size-9 shrink-0 place-items-center rounded-full bg-fill text-fg hover:bg-fill-strong"
                      >
                        <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden />
                      </a>
                    ) : null}
                  </div>
                  {item.notes ? <p className="line-clamp-3 text-sm whitespace-pre-line text-fg-muted">{item.notes}</p> : null}
                  {item.expires_on ? (
                    <div className="mt-auto flex items-center gap-2 text-sm">
                      <Pill tone={days! < 0 ? "critical" : days! <= 30 ? "caution" : "neutral"}>
                        {days! < 0 ? "Caducado" : `Vence ${countdown(item.expires_on, today).replace("quedan ", "en ")}`}
                      </Pill>
                      <span className="text-fg-subtle">{formatWithYear(item.expires_on)}</span>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
