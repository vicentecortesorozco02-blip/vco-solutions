"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { loadEntity } from "@/app/panel/actions";
import { type EntityKind, isEntityKind } from "@/lib/life/entities";
import { EDIT_PARAM, INBOX_PARAM, NEW_PARAM, VALUE_PREFIX } from "@/lib/life/links";

import { DialogShell, EntityDialog, type Relations } from "./EntityDialog";

/** Does this URL only open or close a dialog? */
function isDialogUrl(url: URL, pathname: string): boolean {
  if (url.origin !== window.location.origin || url.pathname !== pathname) return false;
  const current = new URLSearchParams(window.location.search);
  const next = new URLSearchParams(url.search);
  const dialogKey = (key: string) =>
    key === NEW_PARAM || key === EDIT_PARAM || key === INBOX_PARAM || key.startsWith(VALUE_PREFIX);
  const rest = (params: URLSearchParams) =>
    [...params.entries()]
      .filter(([key]) => !dialogKey(key))
      .sort()
      .join("&");
  // The rest of the query has to match: a link that also changes the view
  // (?vista=lista) still goes through the router.
  return rest(current) === rest(next) && [...next.keys()].some(dialogKey);
}

/**
 * Opens the editor described by the URL:
 *   ?nuevo=task&v_due_date=2026-10-12   create, prefilled
 *   ?editar=task:<uuid>                 edit
 * Closing removes those parameters and keeps everything else (the current
 * calendar view, the tasks filter...).
 */
export function PanelDialogs({ relations, today }: { relations: Relations; today: string }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const newKind = params.get(NEW_PARAM);
  const edit = params.get(EDIT_PARAM);
  const [editKind, editId] = edit?.split(":") ?? [];

  const [record, setRecord] = useState<{ key: string; data: Record<string, unknown> | null } | null>(null);

  /** True while the dialog was opened without asking the server. */
  const pushed = useRef(false);

  const close = useCallback(() => {
    const next = new URLSearchParams(params.toString());
    for (const key of [...next.keys()]) {
      if (key === NEW_PARAM || key === EDIT_PARAM || key === INBOX_PARAM || key.startsWith(VALUE_PREFIX)) {
        next.delete(key);
      }
    }
    const query = next.toString();
    setRecord(null);
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
      return;
    }
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  /**
   * Opening an editor is a change of URL, not a change of page.
   *
   * Links like ?editar=task:<id> used to go through the router, which fetched
   * the whole screen again before anything appeared. Pushing the URL by hand
   * keeps the dialog instant; the back button still closes it.
   */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || anchor.target === "_blank") return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (!isDialogUrl(url, pathname)) return;
      event.preventDefault();
      event.stopPropagation();
      pushed.current = true;
      window.history.pushState(null, "", url.toString());
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  useEffect(() => {
    if (!edit || !isEntityKind(editKind) || !editId) return;
    let cancelled = false;
    loadEntity(editKind, editId).then((data) => {
      if (!cancelled) setRecord({ key: edit, data });
    });
    return () => {
      cancelled = true;
    };
  }, [edit, editKind, editId]);

  if (isEntityKind(newKind)) {
    const prefill: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      if (key.startsWith(VALUE_PREFIX)) prefill[key.slice(VALUE_PREFIX.length)] = value;
    }
    return (
      <EntityDialog
        key={params.toString()}
        kind={newKind as EntityKind}
        prefill={prefill}
        inboxId={params.get(INBOX_PARAM)}
        relations={relations}
        today={today}
        onClose={close}
      />
    );
  }

  if (edit && isEntityKind(editKind) && record?.key !== edit) {
    // The row is on its way: the dialog is already there, so the tap feels
    // answered instead of silent.
    return <DialogShell title="Abriendo…" onClose={close} />;
  }

  if (edit && isEntityKind(editKind) && record?.key === edit) {
    if (!record.data) return null;
    return (
      <EntityDialog
        key={edit}
        kind={editKind}
        record={record.data}
        relations={relations}
        today={today}
        onClose={close}
      />
    );
  }

  return null;
}
