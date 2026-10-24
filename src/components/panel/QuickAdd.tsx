"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import type { EntityKind } from "@/lib/life/entities";
import { newHref } from "@/lib/life/links";

import { entityIcon } from "./icons";

const actions: { kind: EntityKind; label: string; values?: Record<string, string> }[] = [
  { kind: "task", label: "Nueva tarea" },
  { kind: "event", label: "Nuevo evento" },
  { kind: "charge", label: "Nuevo cargo del banco" },
  { kind: "transaction", label: "Nuevo gasto", values: { kind: "expense" } },
  { kind: "subscription", label: "Nueva suscripción" },
  { kind: "project", label: "Nuevo proyecto" },
  { kind: "vault", label: "Nueva nota", values: { category: "notes" } },
];

/**
 * The "+" that is always there. Opens a short menu; each entry opens its
 * form on top of the current page, so nothing is lost behind it.
 */
export function QuickAdd({ floating = false }: { floating?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative", floating && "fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[var(--z-header)] lg:hidden")}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Añadir"
        className={cn(
          "grid place-items-center rounded-full bg-accent text-accent-fg transition-[transform,background-color] duration-[var(--duration-base)] ease-[var(--ease-out-soft)] hover:bg-accent-hover active:scale-95",
          floating ? "size-14 shadow-[var(--shadow-pop)]" : "size-10",
        )}
      >
        <Plus className={cn("transition-transform duration-[var(--duration-base)]", floating ? "size-6" : "size-5", open && "rotate-45")} strokeWidth={2.25} aria-hidden />
      </button>

      <ul
        id={menuId}
        hidden={!open}
        className={cn(
          "absolute z-[var(--z-overlay)] w-60 overflow-hidden rounded-2xl bg-surface-raised p-1.5 shadow-[var(--shadow-pop)] ring-1 ring-line-soft",
          floating ? "right-0 bottom-16" : "top-12 right-0",
        )}
      >
        {actions.map((action) => {
          const Icon = entityIcon[action.kind];
          return (
            <li key={action.label}>
              <Link
                href={newHref(action.kind, pathname, action.values)}
                scroll={false}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-medium text-fg transition-colors hover:bg-fill"
              >
                <Icon className="size-[1.125rem] text-fg-muted" strokeWidth={1.9} aria-hidden />
                {action.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
