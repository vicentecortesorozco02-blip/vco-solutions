import { Cake, Mail, Phone, Plus, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState, HeaderLink, PageHeader, Pill } from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { diffDays, formatShort, relativeDay } from "@/lib/life/dates";
import { editHref, newHref } from "@/lib/life/links";
import { nextBirthday } from "@/lib/life/recurrence";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Contactos" };

/** Lo importante de cada persona, para no olvidarlo. */
export default async function ContactsPage() {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();

  const upcoming = data.contacts
    .filter((c) => c.birthday)
    .map((c) => ({ contact: c, date: nextBirthday(c.birthday!, today) }))
    .filter(({ date }) => diffDays(today, date) <= 30)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const pending = data.contacts
    .filter((c) => c.next_action)
    .sort((a, b) => (a.next_action_date ?? "9999").localeCompare(b.next_action_date ?? "9999"));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Contactos"
        question="¿Qué tengo pendiente con quién?"
        actions={
          <HeaderLink primary icon={Plus} href={newHref("contact", panelRoutes.contacts)}>
            Nuevo contacto
          </HeaderLink>
        }
      />

      {data.contacts.length === 0 ? (
        <EmptyState icon={Users} title="Nadie todavía">
          Guarda a las personas importantes con su cumpleaños y lo que tienes pendiente con ellas.
        </EmptyState>
      ) : (
        <>
          {upcoming.length || pending.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {upcoming.length ? (
                <section aria-labelledby="bd-title" className="rounded-2xl bg-surface p-5">
                  <h2 id="bd-title" className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
                    <Cake className="size-4 text-fg-subtle" aria-hidden /> Cumpleaños próximos
                  </h2>
                  <ul className="flex flex-col gap-1">
                    {upcoming.map(({ contact, date }) => (
                      <li key={contact.id} className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
                        <span className="truncate text-fg">{contact.name}</span>
                        <span className="shrink-0 text-sm text-fg-muted">
                          {formatShort(date)} · {relativeDay(date, today)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {pending.length ? (
                <section aria-labelledby="pend-title" className="rounded-2xl bg-surface p-5">
                  <h2 id="pend-title" className="mb-3 text-sm font-semibold text-fg">
                    Pendiente con
                  </h2>
                  <ul className="flex flex-col gap-1">
                    {pending.slice(0, 6).map((c) => (
                      <li key={c.id} className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
                        <span className="min-w-0 truncate text-fg">
                          <span className="font-medium">{c.name}:</span> {c.next_action}
                        </span>
                        {c.next_action_date ? (
                          <span className={c.next_action_date < today ? "shrink-0 text-sm text-critical" : "shrink-0 text-sm text-fg-muted"}>
                            {relativeDay(c.next_action_date, today)}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : null}

          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.contacts.map((contact) => (
              <li key={contact.id} className="flex flex-col gap-3 rounded-2xl bg-surface p-5">
                <Link
                  href={editHref("contact", contact.id, panelRoutes.contacts)}
                  scroll={false}
                  className="flex items-center gap-3"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-quiet text-base font-semibold text-accent-text uppercase" aria-hidden>
                    {contact.name.slice(0, 1)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[0.9375rem] font-semibold text-fg">{contact.name}</span>
                    <span className="truncate text-sm text-fg-muted">
                      {[contact.relationship, contact.company].filter(Boolean).join(" · ") || "Contacto"}
                    </span>
                  </span>
                </Link>
                {contact.last_interaction ? (
                  <p className="text-xs text-fg-subtle">Última vez: {relativeDay(contact.last_interaction, today)}</p>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-2">
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-fill px-3 text-sm font-medium text-fg hover:bg-fill-strong">
                      <Phone className="size-3.5" strokeWidth={2} aria-hidden />
                      Llamar
                    </a>
                  ) : null}
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-fill px-3 text-sm font-medium text-fg hover:bg-fill-strong">
                      <Mail className="size-3.5" strokeWidth={2} aria-hidden />
                      Correo
                    </a>
                  ) : null}
                  {contact.birthday ? (
                    <Pill>
                      <Cake className="size-3" strokeWidth={2} aria-hidden />
                      <span className="sr-only">Cumpleaños:</span> {formatShort(contact.birthday)}
                    </Pill>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
