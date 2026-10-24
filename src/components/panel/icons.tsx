import { createElement } from "react";
import {
  Bell,
  BookOpen,
  Briefcase,
  Cake,
  CalendarDays,
  CircleCheck,
  CreditCard,
  Dumbbell,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  Landmark,
  Handshake,
  House,
  type LucideIcon,
  Plane,
  Receipt,
  RefreshCw,
  Repeat,
  StickyNote,
  Stethoscope,
  User,
  Users,
  Vault,
  Wallet,
} from "lucide-react";

import type { PanelNavKey } from "@/config/site";
import type { AgendaKind } from "@/lib/life/agenda";
import type { EntityKind } from "@/lib/life/entities";
import type { EventCategory } from "@/lib/life/model";
import type { ReminderKind } from "@/lib/life/reminders";

/**
 * One icon per concept, used everywhere. The icon carries the category; the
 * label next to it carries the meaning (colour never does it alone).
 */

export const navIcon: Record<PanelNavKey, LucideIcon> = {
  home: House,
  calendar: CalendarDays,
  tasks: CircleCheck,
  projects: FolderKanban,
  university: GraduationCap,
  money: Wallet,
  subscriptions: Repeat,
  domains: Globe,
  contacts: Users,
  documents: Vault,
};

export const categoryIcon: Record<EventCategory, LucideIcon> = {
  personal: User,
  university: GraduationCap,
  work: Briefcase,
  meeting: Handshake,
  payment: CreditCard,
  renewal: RefreshCw,
  birthday: Cake,
  travel: Plane,
  appointment: Stethoscope,
  sport: Dumbbell,
  other: CalendarDays,
};

export const agendaIcon: Record<AgendaKind, LucideIcon> = {
  event: CalendarDays,
  task: CircleCheck,
  charge: Repeat,
  planned: CreditCard,
  domain: Globe,
  vault: FileText,
  birthday: Cake,
  course: GraduationCap,
  followup: Users,
};

export const reminderIcon: Record<ReminderKind, LucideIcon> = {
  task: CircleCheck,
  course: BookOpen,
  exam: GraduationCap,
  charge: Repeat,
  planned: CreditCard,
  domain: Globe,
  vault: FileText,
  birthday: Cake,
  followup: Users,
  event: Bell,
};

export const entityIcon: Record<EntityKind, LucideIcon> = {
  task: CircleCheck,
  event: CalendarDays,
  subscription: Repeat,
  transaction: Wallet,
  account: Landmark,
  charge: Receipt,
  partner: Handshake,
  projectPartner: Handshake,
  project: FolderKanban,
  course: GraduationCap,
  courseItem: BookOpen,
  domain: Globe,
  contact: Users,
  vault: Vault,
  inbox: StickyNote,
};

/** Icon for an agenda item: events use their category, the rest their kind. */
export function iconForAgenda(kind: AgendaKind, category: EventCategory): LucideIcon {
  return kind === "event" ? categoryIcon[category] : agendaIcon[kind];
}

/** Renders the icon for an agenda item. */
export function AgendaIcon({
  kind,
  category,
  className,
  strokeWidth = 1.8,
}: {
  kind: AgendaKind;
  category: EventCategory;
  className?: string;
  strokeWidth?: number;
}) {
  return createElement(iconForAgenda(kind, category), { className, strokeWidth, "aria-hidden": true });
}
