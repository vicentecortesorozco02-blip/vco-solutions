import { addDays, diffDays, shortTime } from "./dates";
import type {
  Account,
  CalendarEvent,
  Charge,
  Contact,
  Course,
  CourseItem,
  Domain,
  EventCategory,
  ISODate,
  Priority,
  Project,
  ChargeShare,
  Partner,
  ProjectPartner,
  Subscription,
  SubscriptionPrice,
  Task,
  Transaction,
  VaultItem,
} from "./model";
import { courseItemKindLabel } from "./model";
import { chargesBetween, eventOccurrences, nextBirthday } from "./recurrence";

/**
 * One timeline built from every module.
 *
 * The calendar, the home screen and "Fechas importantes" all read this list,
 * so a domain renewal or a birthday shows up everywhere without being typed
 * twice as an event.
 */

export interface LifeData {
  events: CalendarEvent[];
  tasks: Task[];
  subscriptions: Subscription[];
  transactions: Transaction[];
  /** What actually happened, as opposed to what is forecast. */
  charges: Charge[];
  prices: SubscriptionPrice[];
  accounts: Account[];
  partners: Partner[];
  projectPartners: ProjectPartner[];
  chargeShares: ChargeShare[];
  domains: Domain[];
  vault: VaultItem[];
  contacts: Contact[];
  courses: Course[];
  courseItems: CourseItem[];
  projects: Project[];
}

export const emptyLifeData: LifeData = {
  events: [],
  tasks: [],
  subscriptions: [],
  transactions: [],
  charges: [],
  prices: [],
  accounts: [],
  partners: [],
  projectPartners: [],
  chargeShares: [],
  domains: [],
  vault: [],
  contacts: [],
  courses: [],
  courseItems: [],
  projects: [],
};

export type AgendaKind =
  | "event"
  | "task"
  | "charge"
  | "planned"
  | "domain"
  | "vault"
  | "birthday"
  | "course"
  | "followup";

export interface AgendaItem {
  /** Stable across renders: kind, source id and date. */
  key: string;
  kind: AgendaKind;
  sourceId: string;
  date: ISODate;
  endDate?: ISODate;
  time?: string | null;
  endTime?: string | null;
  title: string;
  detail?: string;
  /** Event category, or the closest one for derived items. Drives the icon. */
  category: EventCategory;
  amount?: number;
  /** The currency of `amount`. Absent means euros. */
  currency?: string;
  priority?: Priority;
  done?: boolean;
}

/** Which kinds count as "important dates" (cumpleaños, renovaciones...). */
export const MILESTONE_KINDS: readonly AgendaKind[] = [
  "birthday",
  "domain",
  "vault",
  "charge",
  "planned",
  "course",
];

export function buildAgenda(data: LifeData, from: ISODate, to: ISODate): AgendaItem[] {
  const items: AgendaItem[] = [];
  const courseName = new Map(data.courses.map((c) => [c.id, c.name]));

  for (const event of data.events) {
    for (const date of eventOccurrences(event, from, to)) {
      items.push({
        key: `event:${event.id}:${date}`,
        kind: "event",
        sourceId: event.id,
        date,
        endDate: event.end_date ? addDays(date, Math.max(0, diffDays(event.date, event.end_date))) : undefined,
        time: shortTime(event.start_time),
        endTime: shortTime(event.end_time),
        title: event.title,
        detail: event.location ?? undefined,
        category: event.category,
      });
    }
  }

  for (const task of data.tasks) {
    if (!task.due_date || task.due_date < from || task.due_date > to) continue;
    items.push({
      key: `task:${task.id}`,
      kind: "task",
      sourceId: task.id,
      date: task.due_date,
      time: shortTime(task.due_time),
      title: task.title,
      category: task.course_id ? "university" : "personal",
      priority: task.priority,
      done: task.status === "done",
    });
  }

  for (const item of data.courseItems) {
    if (!item.due_date || item.due_date < from || item.due_date > to) continue;
    const course = courseName.get(item.course_id);
    items.push({
      key: `course:${item.id}`,
      kind: "course",
      sourceId: item.id,
      date: item.due_date,
      time: shortTime(item.due_time),
      title: item.title,
      detail: [courseItemKindLabel[item.kind], course].filter(Boolean).join(" · "),
      category: "university",
      priority: item.priority,
      done: item.status === "done",
    });
  }

  // Only what can be forecast: a cancelled, usage-based or unconfirmed
  // subscription has no next date to put on a calendar.
  for (const sub of data.subscriptions) {
    if (sub.status === "cancelled") continue;
    for (const date of chargesBetween(sub, from, to)) {
      items.push({
        key: `charge:${sub.id}:${date}`,
        kind: "charge",
        sourceId: sub.id,
        date,
        title: sub.name,
        detail: sub.amount === null ? "Cobro, importe sin confirmar" : "Cobro de suscripción",
        category: "payment",
        amount: sub.amount === null ? undefined : Number(sub.amount),
        currency: sub.currency,
      });
    }
  }

  for (const tx of data.transactions) {
    if (!tx.planned || tx.kind !== "expense" || tx.date < from || tx.date > to) continue;
    items.push({
      key: `planned:${tx.id}`,
      kind: "planned",
      sourceId: tx.id,
      date: tx.date,
      title: tx.description || "Pago previsto",
      detail: "Pago previsto",
      category: "payment",
      amount: Number(tx.amount),
    });
  }

  for (const domain of data.domains) {
    if (!domain.renews_on || domain.renews_on < from || domain.renews_on > to) continue;
    items.push({
      key: `domain:${domain.id}`,
      kind: "domain",
      sourceId: domain.id,
      date: domain.renews_on,
      title: domain.domain,
      detail: domain.auto_renew ? "Renovación automática" : "Renovación manual",
      category: "renewal",
      amount: domain.cost ?? undefined,
    });
  }

  for (const doc of data.vault) {
    if (!doc.expires_on || doc.expires_on < from || doc.expires_on > to) continue;
    items.push({
      key: `vault:${doc.id}`,
      kind: "vault",
      sourceId: doc.id,
      date: doc.expires_on,
      title: doc.title,
      detail: "Vence",
      category: "renewal",
    });
  }

  for (const contact of data.contacts) {
    if (contact.birthday) {
      // Birthdays repeat: look at this year's and next year's around the range.
      for (let cursor = from; cursor <= to; ) {
        const date = nextBirthday(contact.birthday, cursor);
        if (date > to) break;
        items.push({
          key: `birthday:${contact.id}:${date}`,
          kind: "birthday",
          sourceId: contact.id,
          date,
          title: contact.name,
          detail: "Cumpleaños",
          category: "birthday",
        });
        cursor = addDays(date, 1);
      }
    }
    if (contact.next_action && contact.next_action_date && contact.next_action_date >= from && contact.next_action_date <= to) {
      items.push({
        key: `followup:${contact.id}`,
        kind: "followup",
        sourceId: contact.id,
        date: contact.next_action_date,
        title: contact.next_action,
        detail: contact.name,
        category: "personal",
      });
    }
  }

  return items.sort(compareAgenda);
}

/** By date, then timed before untimed, then by time, then by title. */
export function compareAgenda(a: AgendaItem, b: AgendaItem): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  const at = a.time ?? "99";
  const bt = b.time ?? "99";
  if (at !== bt) return at < bt ? -1 : 1;
  return a.title.localeCompare(b.title, "es");
}

/** Items whose span covers `date` (a three-day trip shows on all three). */
export function itemsOn(items: AgendaItem[], date: ISODate): AgendaItem[] {
  return items.filter((item) => item.date === date || (item.endDate && item.date <= date && item.endDate >= date));
}
