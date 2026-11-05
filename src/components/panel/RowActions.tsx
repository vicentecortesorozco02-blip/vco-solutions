"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { deleteEntity } from "@/app/panel/actions";
import { cn } from "@/lib/cn";
import type { EntityKind } from "@/lib/life/entities";

/**
 * Edit and delete right on the row, so changing a record is one click.
 * Delete asks once more on the same button before it goes.
 */
export function RowActions({ kind, id, label, editHref }: { kind: EntityKind; id: string; label: string; editHref: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="flex shrink-0 items-center gap-1">
      <Link
        href={editHref}
        scroll={false}
        aria-label={`Editar ${label}`}
        className="grid size-9 place-items-center rounded-full text-fg-muted transition-colors hover:bg-fill hover:text-fg"
      >
        <Pencil className="size-4" strokeWidth={2} aria-hidden />
      </Link>
      <button
        type="button"
        disabled={pending}
        onBlur={() => setConfirm(false)}
        onClick={() => {
          if (!confirm) return setConfirm(true);
          start(async () => {
            const result = await deleteEntity(kind, id);
            if (!result.ok) setError(result.message ?? "No se pudo borrar.");
            setConfirm(false);
          });
        }}
        aria-label={confirm ? `Confirmar: borrar ${label}` : `Borrar ${label}`}
        title={error ?? undefined}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-sm font-medium transition-colors",
          confirm ? "bg-critical text-accent-fg" : "text-fg-muted hover:bg-critical-quiet hover:text-critical",
        )}
      >
        <Trash2 className="size-4" strokeWidth={2} aria-hidden />
        {confirm ? (pending ? "Borrando…" : "¿Borrar?") : null}
      </button>
    </span>
  );
}
