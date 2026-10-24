import type { AgendaItem, AgendaKind } from "./agenda";
import { formatMoney } from "./money";
import type { EventCategory, Project, TagColor } from "./model";
import { eventCategoryLabel } from "./model";

/**
 * Colour for everything that lands on the calendar.
 *
 * A project's own colour wins, because that is the grouping the user chose.
 * Otherwise the kind of thing decides: money is amber, study violet, people
 * rose. The colour never travels alone — every chip also carries its name —
 * so the calendar reads the same to someone who cannot tell them apart.
 */
export const categoryColor: Record<EventCategory, TagColor> = {
  personal: "slate",
  university: "violet",
  work: "sky",
  meeting: "sky",
  payment: "amber",
  renewal: "amber",
  birthday: "rose",
  travel: "teal",
  appointment: "mint",
  sport: "mint",
  other: "sand",
};

export const kindColor: Record<AgendaKind, TagColor> = {
  event: "sky",
  task: "mint",
  charge: "amber",
  planned: "amber",
  domain: "amber",
  vault: "sand",
  birthday: "rose",
  course: "violet",
  followup: "teal",
};

export function colorForAgenda(item: AgendaItem, projectColor?: TagColor | null): TagColor {
  if (projectColor) return projectColor;
  return item.kind === "event" ? categoryColor[item.category] : kindColor[item.kind];
}

const kindLabel: Record<AgendaKind, string> = {
  event: "Evento",
  task: "Tarea",
  charge: "Cobro de suscripción",
  planned: "Pago previsto",
  domain: "Renovación de dominio",
  vault: "Documento que vence",
  birthday: "Cumpleaños",
  course: "Entrega",
  followup: "Seguimiento",
};

/**
 * Everything about one item in a single line, for the tooltip that appears
 * on hover and on keyboard focus. Clicking opens the real editor.
 */
export function agendaTooltip(item: AgendaItem, project?: Project | null): string {
  const when = item.time ? (item.endTime ? `${item.time}–${item.endTime}` : item.time) : "Todo el día";
  return [
    item.title,
    when,
    item.kind === "event" ? eventCategoryLabel[item.category] : kindLabel[item.kind],
    item.detail,
    item.amount !== undefined ? formatMoney(item.amount) : null,
    project ? `Proyecto: ${project.name}` : null,
    item.done ? "Hecho" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
