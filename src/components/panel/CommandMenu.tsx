"use client";

import { CornerDownLeft, Plus, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";

import { type SearchHit, searchEverything } from "@/app/panel/actions";
import { panelNav, panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";
import { editHref, newHref } from "@/lib/life/links";

import { entityIcon, navIcon } from "./icons";

interface Item {
  key: string;
  title: string;
  detail: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
}

/**
 * ⌘K / Ctrl+K. Searches every table at once, jumps between sections and
 * turns whatever was typed into a task or an inbox note when nothing fits.
 */
export function CommandMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      input.current?.focus();
    }
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) return;
    const timer = setTimeout(() => {
      startTransition(async () => {
        setHits(await searchEverything(term));
        setActive(0);
      });
    }, 160);
    return () => clearTimeout(timer);
  }, [query]);

  const items: Item[] = useMemo(() => {
    const term = query.trim().toLowerCase();
    const sections = [...panelNav, { key: "inbox", label: "Inbox", href: panelRoutes.inbox }, { key: "dates", label: "Fechas importantes", href: panelRoutes.dates }]
      .filter((item) => !term || item.label.toLowerCase().includes(term))
      .map((item) => ({
        key: `nav:${item.key}`,
        title: item.label,
        detail: "Ir a",
        href: item.href,
        icon: item.key in navIcon ? navIcon[item.key as keyof typeof navIcon] : Search,
      }));
    if (term.length < 2) return sections;

    const found = hits.map((hit) => ({
      key: `${hit.kind}:${hit.id}`,
      title: hit.title,
      detail: hit.detail,
      href: editHref(hit.kind, hit.id),
      icon: entityIcon[hit.kind],
    }));
    const create = [
      {
        key: "create:task",
        title: `Crear tarea «${query.trim()}»`,
        detail: "Nueva tarea",
        href: newHref("task", pathname, { title: query.trim() }),
        icon: Plus,
      },
    ];
    return [...found, ...sections, ...create];
  }, [hits, query, pathname]);

  function go(item: Item | undefined) {
    if (!item) return;
    setOpen(false);
    setQuery("");
    setHits([]);
    router.push(item.href, { scroll: false });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-10 w-full items-center gap-2 rounded-full bg-fill px-3.5 text-sm text-fg-subtle transition-colors hover:bg-fill-strong lg:max-w-xs"
      >
        <Search className="size-4" strokeWidth={2} aria-hidden />
        <span className="flex-1 text-left">Buscar</span>
        <kbd className="hidden rounded-md bg-surface px-1.5 font-sans text-xs text-fg-subtle lg:inline">⌘K</kbd>
      </button>

      <dialog
        ref={dialog}
        aria-label="Buscar en el panel"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialog.current) setOpen(false);
        }}
        className="mx-auto mt-[10dvh] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-[1.5rem] bg-surface-raised p-0 text-fg shadow-[var(--shadow-pop)] backdrop:bg-scrim"
      >
        <div className="flex items-center gap-3 border-b border-line-soft px-5">
          <Search className="size-5 text-fg-subtle" strokeWidth={2} aria-hidden />
          <input
            ref={input}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (event.target.value.trim().length < 2) setHits([]);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((i) => Math.min(i + 1, items.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                go(items[active]);
              }
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
            aria-label="Buscar tareas, eventos, proyectos, personas…"
            placeholder="Buscar tareas, eventos, proyectos, personas…"
            className="min-h-14 flex-1 bg-transparent text-base text-fg placeholder:text-fg-quiet focus:outline-none"
          />
          {pending ? <span className="text-xs text-fg-subtle">Buscando…</span> : null}
        </div>

        <ul id={listId} role="listbox" aria-label="Resultados" className="max-h-[55dvh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-fg-muted">Nada con «{query}».</li>
          ) : (
            items.map((item, index) => (
              <li
                key={item.key}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onPointerMove={() => setActive(index)}
                onClick={() => go(item)}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3",
                  index === active ? "bg-fill-strong" : "",
                )}
              >
                <item.icon className="size-[1.125rem] shrink-0 text-fg-muted" strokeWidth={1.9} aria-hidden />
                <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-fg">{item.title}</span>
                <span className="shrink-0 text-xs text-fg-subtle">{item.detail}</span>
                {index === active ? <CornerDownLeft className="size-3.5 text-fg-subtle" aria-hidden /> : null}
              </li>
            ))
          )}
        </ul>
      </dialog>
    </>
  );
}
