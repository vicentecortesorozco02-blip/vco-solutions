import { panelRoutes } from "@/config/site";

import type { AgendaItem } from "./agenda";
import type { EntityKind } from "./entities";

/**
 * Where each record lives, and the URLs that open its dialog.
 *
 * Dialogs are driven by the query string (?nuevo=task, ?editar=task:<id>),
 * so a search result, a calendar cell and a list row can all open the same
 * editor with a plain link, and the back button closes it.
 */
export const homeOf: Record<EntityKind, string> = {
  task: panelRoutes.tasks,
  event: panelRoutes.calendar,
  subscription: panelRoutes.subscriptions,
  transaction: panelRoutes.money,
  account: panelRoutes.money,
  charge: panelRoutes.money,
  partner: panelRoutes.projects,
  projectPartner: panelRoutes.projects,
  project: panelRoutes.projects,
  course: panelRoutes.university,
  courseItem: panelRoutes.university,
  domain: panelRoutes.domains,
  contact: panelRoutes.contacts,
  vault: panelRoutes.documents,
  inbox: panelRoutes.inbox,
};

export const NEW_PARAM = "nuevo";
export const EDIT_PARAM = "editar";
export const INBOX_PARAM = "desde";
/** Prefilled values travel as v_<field>=value. */
export const VALUE_PREFIX = "v_";

const join = (path: string) => (path.includes("?") ? "&" : "?");

/** `path` may already carry a query (?vista=mes): it is kept. */
export function editHref(kind: EntityKind, id: string, path: string = homeOf[kind]): string {
  return `${path}${join(path)}${EDIT_PARAM}=${kind}:${id}`;
}

export function newHref(
  kind: EntityKind,
  path: string = homeOf[kind],
  values: Record<string, string | null | undefined> = {},
): string {
  const params = new URLSearchParams({ [NEW_PARAM]: kind });
  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key === INBOX_PARAM ? key : `${VALUE_PREFIX}${key}`, value);
  }
  return `${path}${join(path)}${params.toString()}`;
}

/** The record behind an agenda item, opened over `path`. */
export function agendaHref(item: Pick<AgendaItem, "kind" | "sourceId">, path?: string): string {
  const kind: EntityKind = {
    event: "event",
    task: "task",
    course: "courseItem",
    charge: "subscription",
    planned: "transaction",
    domain: "domain",
    vault: "vault",
    birthday: "contact",
    followup: "contact",
  }[item.kind] as EntityKind;
  return editHref(kind, item.sourceId, path ?? homeOf[kind]);
}
