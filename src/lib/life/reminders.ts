import { panelRoutes } from "@/config/site";

import type { LifeData } from "./agenda";
import { addDays, countdown, diffDays, relativeDay } from "./dates";
import { formatMoney } from "./money";
import type { ISODate } from "./model";
import { courseItemKindLabel, priorityWeight } from "./model";
import { chargesBetween, nextBirthday } from "./recurrence";

/**
 * Reminders and priorities, derived from the data on every request.
 *
 * Nothing is scheduled or sent: the home screen asks "what should I know
 * now?" and these functions answer. When notifications arrive (email, push),
 * they will read the same list, so the rules live in one place.
 */

export type ReminderLevel = "critical" | "soon" | "info";

export type ReminderKind =
  | "task"
  | "course"
  | "exam"
  | "charge"
  | "planned"
  | "domain"
  | "vault"
  | "birthday"
  | "followup"
  | "event";

export interface Reminder {
  key: string;
  level: ReminderLevel;
  kind: ReminderKind;
  title: string;
  detail: string;
  date: ISODate;
  href: string;
}

/** Days ahead each kind starts to matter. */
export const REMINDER_WINDOWS = {
  exam: 14,
  course: 7,
  charge: 3,
  planned: 3,
  domain: 30,
  vault: 30,
  birthday: 7,
  followup: 2,
} as const;

/** Domains warn at 30, 15 and 7 days. */
export function domainLevel(daysLeft: number): ReminderLevel | null {
  if (daysLeft < 0 || daysLeft <= 7) return "critical";
  if (daysLeft <= 15) return "soon";
  if (daysLeft <= 30) return "info";
  return null;
}

const levelRank: Record<ReminderLevel, number> = { critical: 0, soon: 1, info: 2 };

export function deriveReminders(data: LifeData, today: ISODate): Reminder[] {
  const out: Reminder[] = [];
  const courseName = new Map(data.courses.map((c) => [c.id, c.name]));

  for (const task of data.tasks) {
    if (task.status === "done" || !task.due_date || task.due_date >= today) continue;
    out.push({
      key: `task:${task.id}`,
      level: "critical",
      kind: "task",
      title: task.title,
      detail: `Tarea vencida · ${countdown(task.due_date, today)}`,
      date: task.due_date,
      href: panelRoutes.tasks,
    });
  }

  for (const item of data.courseItems) {
    if (item.status === "done" || !item.due_date) continue;
    const days = diffDays(today, item.due_date);
    const isExam = item.kind === "exam";
    const window = isExam ? REMINDER_WINDOWS.exam : REMINDER_WINDOWS.course;
    if (days > window) continue;
    const course = courseName.get(item.course_id);
    const label = courseItemKindLabel[item.kind];
    out.push({
      key: `course:${item.id}`,
      level: days < 0 ? "critical" : days <= 2 ? "soon" : "info",
      kind: isExam ? "exam" : "course",
      title: `${label} de ${course ?? item.title}`,
      detail: isExam
        ? days < 0
          ? countdown(item.due_date, today)
          : `${item.title} · ${days === 0 ? "hoy" : days === 1 ? "mañana" : `dentro de ${days} días`}`
        : `${item.title} · ${countdown(item.due_date, today)}`,
      date: item.due_date,
      href: panelRoutes.university,
    });
  }

  const chargeEnd = addDays(today, REMINDER_WINDOWS.charge);
  for (const sub of data.subscriptions) {
    if (sub.status === "cancelled") continue;
    for (const date of chargesBetween(sub, today, chargeEnd)) {
      const days = diffDays(today, date);
      out.push({
        key: `charge:${sub.id}:${date}`,
        level: days <= 1 ? "soon" : "info",
        kind: "charge",
        title: `Cobro de ${sub.name}`,
        detail: [
          sub.amount === null ? "Importe sin confirmar" : formatMoney(Number(sub.amount)),
          relativeDay(date, today),
        ].join(" · "),
        date,
        href: panelRoutes.subscriptions,
      });
    }
  }

  for (const tx of data.transactions) {
    if (!tx.planned || tx.kind !== "expense") continue;
    const days = diffDays(today, tx.date);
    if (days > REMINDER_WINDOWS.planned) continue;
    out.push({
      key: `planned:${tx.id}`,
      level: days < 0 ? "critical" : days <= 1 ? "soon" : "info",
      kind: "planned",
      title: tx.description || "Pago previsto",
      detail: `${formatMoney(Number(tx.amount))} · ${days < 0 ? `sin marcar como pagado, ${relativeDay(tx.date, today)}` : relativeDay(tx.date, today)}`,
      date: tx.date,
      href: panelRoutes.money,
    });
  }

  for (const domain of data.domains) {
    if (!domain.renews_on) continue;
    const days = diffDays(today, domain.renews_on);
    const level = domainLevel(days);
    if (!level) continue;
    out.push({
      key: `domain:${domain.id}`,
      level: domain.auto_renew && level !== "critical" ? "info" : level,
      kind: "domain",
      title: `${domain.domain} renueva pronto`,
      detail: `${days < 0 ? "Renovación pasada" : countdown(domain.renews_on, today)}${domain.auto_renew ? " · automática" : " · manual"}`,
      date: domain.renews_on,
      href: panelRoutes.domains,
    });
  }

  for (const doc of data.vault) {
    if (!doc.expires_on) continue;
    const days = diffDays(today, doc.expires_on);
    if (days > REMINDER_WINDOWS.vault) continue;
    out.push({
      key: `vault:${doc.id}`,
      level: days <= 7 ? "critical" : days <= 15 ? "soon" : "info",
      kind: "vault",
      title: `${doc.title} vence`,
      detail: countdown(doc.expires_on, today),
      date: doc.expires_on,
      href: panelRoutes.documents,
    });
  }

  for (const contact of data.contacts) {
    if (contact.birthday) {
      const date = nextBirthday(contact.birthday, today);
      const days = diffDays(today, date);
      if (days <= REMINDER_WINDOWS.birthday) {
        out.push({
          key: `birthday:${contact.id}`,
          level: days === 0 ? "soon" : "info",
          kind: "birthday",
          title: `Cumpleaños de ${contact.name}`,
          detail: relativeDay(date, today),
          date,
          href: panelRoutes.contacts,
        });
      }
    }
    if (contact.next_action && contact.next_action_date) {
      const days = diffDays(today, contact.next_action_date);
      if (days <= REMINDER_WINDOWS.followup) {
        out.push({
          key: `followup:${contact.id}`,
          level: days < 0 ? "soon" : "info",
          kind: "followup",
          title: contact.next_action,
          detail: `${contact.name} · ${relativeDay(contact.next_action_date, today)}`,
          date: contact.next_action_date,
          href: panelRoutes.contacts,
        });
      }
    }
  }

  return out.sort((a, b) => levelRank[a.level] - levelRank[b.level] || (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// ---------------------------------------------------------------------------
// "Lo más importante ahora": at most three things, each with its reason.
// ---------------------------------------------------------------------------

export interface Focus {
  key: string;
  title: string;
  reason: string;
  href: string;
  /** Set when the item is a task: the home screen can complete it in place. */
  taskId?: string;
  score: number;
}

export function topPriorities(data: LifeData, today: ISODate, limit = 3): Focus[] {
  const candidates: Focus[] = [];
  const courseName = new Map(data.courses.map((c) => [c.id, c.name]));

  for (const task of data.tasks) {
    if (task.status === "done") continue;
    const weight = priorityWeight[task.priority];
    if (task.due_date) {
      const days = diffDays(today, task.due_date);
      if (days < 0) {
        candidates.push({
          key: `task:${task.id}`,
          title: task.title,
          reason: `Vencida ${relativeDay(task.due_date, today)}`,
          href: panelRoutes.tasks,
          taskId: task.id,
          score: 100 + weight * 10 + Math.min(-days, 14),
        });
      } else if (days === 0) {
        candidates.push({
          key: `task:${task.id}`,
          title: task.title,
          reason: task.due_time ? `Hoy a las ${task.due_time.slice(0, 5)}` : "Para hoy",
          href: panelRoutes.tasks,
          taskId: task.id,
          score: 70 + weight * 8,
        });
      } else if (days === 1 && weight >= 2) {
        candidates.push({
          key: `task:${task.id}`,
          title: task.title,
          reason: "Mañana, prioridad alta",
          href: panelRoutes.tasks,
          taskId: task.id,
          score: 55 + weight * 5,
        });
      }
    } else if (task.status === "in_progress") {
      candidates.push({
        key: `task:${task.id}`,
        title: task.title,
        reason: "En progreso",
        href: panelRoutes.tasks,
        taskId: task.id,
        score: 40 + weight * 5,
      });
    }
  }

  for (const item of data.courseItems) {
    if (item.status === "done" || !item.due_date) continue;
    const days = diffDays(today, item.due_date);
    if (days > 7) continue;
    const isExam = item.kind === "exam";
    const course = courseName.get(item.course_id);
    candidates.push({
      key: `course:${item.id}`,
      title: `${courseItemKindLabel[item.kind]}: ${item.title}`,
      reason: [course, countdown(item.due_date, today)].filter(Boolean).join(" · "),
      href: panelRoutes.university,
      score: days < 0 ? 95 : days <= 3 ? (isExam ? 90 : 85) - days : 60 - days,
    });
  }

  for (const sub of data.subscriptions) {
    if (sub.status === "cancelled") continue;
    for (const date of chargesBetween(sub, today, addDays(today, 1))) {
      candidates.push({
        key: `charge:${sub.id}:${date}`,
        title: `Cobro de ${sub.name}`,
        reason: [
          sub.amount === null ? "Importe sin confirmar" : formatMoney(Number(sub.amount)),
          relativeDay(date, today),
        ].join(" "),
        href: panelRoutes.subscriptions,
        score: 62,
      });
    }
  }

  for (const tx of data.transactions) {
    if (!tx.planned || tx.kind !== "expense") continue;
    const days = diffDays(today, tx.date);
    if (days > 1) continue;
    candidates.push({
      key: `planned:${tx.id}`,
      title: tx.description || "Pago previsto",
      reason: `${formatMoney(Number(tx.amount))} · ${days < 0 ? "pendiente de pagar" : relativeDay(tx.date, today)}`,
      href: panelRoutes.money,
      score: days < 0 ? 80 : 75,
    });
  }

  for (const domain of data.domains) {
    if (!domain.renews_on || domain.auto_renew) continue;
    const days = diffDays(today, domain.renews_on);
    if (days > 15) continue;
    candidates.push({
      key: `domain:${domain.id}`,
      title: `Renovar ${domain.domain}`,
      reason: countdown(domain.renews_on, today),
      href: panelRoutes.domains,
      score: days <= 7 ? 80 : 50,
    });
  }

  for (const doc of data.vault) {
    if (!doc.expires_on) continue;
    const days = diffDays(today, doc.expires_on);
    if (days > 7) continue;
    candidates.push({
      key: `vault:${doc.id}`,
      title: `${doc.title} vence`,
      reason: countdown(doc.expires_on, today),
      href: panelRoutes.documents,
      score: 70,
    });
  }

  return candidates.sort((a, b) => b.score - a.score).slice(0, limit);
}
