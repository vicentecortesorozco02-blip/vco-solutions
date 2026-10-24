"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  /** Posted with the form. Omit when the select only drives an action. */
  name?: string;
  /** Controlled value. Leave out to let the select keep its own. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  id?: string;
  placeholder?: string;
  size?: "md" | "sm";
  className?: string;
  autoFocus?: boolean;
  "aria-invalid"?: boolean | undefined;
  "aria-describedby"?: string | undefined;
  "aria-label"?: string;
}

interface Anchor {
  left: number;
  width: number;
  /** Where the list starts, already measured against the viewport. */
  top: number;
  maxHeight: number;
}

/**
 * El desplegable propio.
 *
 * A native <select> paints itself with the operating system's widget, which
 * on macOS looks nothing like the rest of the app. This is a button plus a
 * listbox, so it follows the design tokens everywhere, and it keeps what a
 * native select gives for free: a label, keyboard control, type-ahead and a
 * value that travels in the form.
 */
export function Select({
  options,
  name,
  value,
  defaultValue,
  onValueChange,
  id,
  placeholder = "Elige una",
  size = "md",
  className,
  autoFocus,
  "aria-invalid": invalid,
  "aria-describedby": describedBy,
  "aria-label": label,
}: SelectProps) {
  const listId = useId();
  const optionId = useId();
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = value ?? internal;
  const index = options.findIndex((option) => option.value === current);
  const selected = index >= 0 ? options[index] : null;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const measure = () => {
    const box = button.current?.getBoundingClientRect();
    if (!box) return;
    // Inside a <dialog> the list has to live in the dialog too: the top layer
    // paints over anything portalled into the body.
    setHost(button.current?.closest("dialog") ?? document.body);
    const below = window.innerHeight - box.bottom - 12;
    const above = box.top - 12;
    const downwards = below > 200 || below >= above;
    setAnchor({
      left: box.left,
      width: box.width,
      top: downwards ? box.bottom + 6 : Math.max(12, box.top - 6 - Math.min(above, 320)),
      maxHeight: Math.min(320, Math.max(160, downwards ? below : above)),
    });
  };

  const show = (from = index < 0 ? 0 : index) => {
    measure();
    setActive(Math.max(0, from));
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  };

  const pick = (option: SelectOption) => {
    if (value === undefined) setInternal(option.value);
    onValueChange?.(option.value);
    close();
  };

  // Focus follows the list while it is open, so the arrows belong to it.
  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!list.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    // Al desplazar la página la lista sigue al botón en vez de cerrarse; solo
    // se cierra cuando el botón ya no está a la vista.
    const onScroll = (event: Event) => {
      if (list.current?.contains(event.target as Node)) return;
      const box = button.current?.getBoundingClientRect();
      if (!box || box.bottom < 0 || box.top > window.innerHeight) {
        setOpen(false);
        return;
      }
      measure();
    };
    document.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  /** Jump to the first option that starts with what was typed. */
  const typeAhead = (key: string, from: number) => {
    const now = Date.now();
    typed.current = { text: now - typed.current.at > 800 ? key : typed.current.text + key, at: now };
    const text = typed.current.text.toLowerCase();
    const order = [...options.slice(from + 1), ...options.slice(0, from + 1)];
    const found = order.find((option) => option.label.toLowerCase().startsWith(text));
    return found ? options.indexOf(found) : -1;
  };

  const onListKey = (event: React.KeyboardEvent) => {
    const last = options.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((at) => Math.min(last, at + 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        setActive((at) => Math.max(0, at - 1));
        return;
      case "Home":
        event.preventDefault();
        setActive(0);
        return;
      case "End":
        event.preventDefault();
        setActive(last);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (options[active]) pick(options[active]);
        return;
      case "Escape":
        event.preventDefault();
        close();
        return;
      case "Tab":
        close(false);
        return;
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          const found = typeAhead(event.key, active);
          if (found >= 0) {
            event.preventDefault();
            setActive(found);
          }
        }
    }
  };

  const onButtonKey = (event: React.KeyboardEvent) => {
    // Enter y Espacio ya activan el botón: si además se abriera aquí, el
    // clic nativo que viene detrás volvería a cerrar la lista.
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      show(event.key === "ArrowUp" ? (index < 0 ? options.length - 1 : index) : undefined);
      return;
    }
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const found = typeAhead(event.key, index);
      if (found >= 0) {
        event.preventDefault();
        pick(options[found]);
      }
    }
  };

  return (
    <>
      {name ? <input type="hidden" name={name} value={current} /> : null}
      <button
        ref={button}
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-label={label}
        autoFocus={autoFocus}
        onClick={() => (open ? close() : show())}
        onKeyDown={onButtonKey}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl bg-surface text-left text-fg ring-1 ring-inset ring-line-field transition-shadow",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          size === "sm" ? "min-h-8 px-2 text-xs" : "min-h-11 px-3.5 text-[0.9375rem]",
          open && "ring-2 ring-accent",
          className,
        )}
      >
        <span className={cn("truncate", !selected && "text-fg-quiet")}>{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={cn(
            "shrink-0 text-fg-subtle transition-transform",
            size === "sm" ? "size-3.5" : "size-4",
            open && "rotate-180",
          )}
          strokeWidth={2.25}
          aria-hidden
        />
      </button>

      {open && anchor && host
        ? createPortal(
            <ul
              ref={list}
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-activedescendant={options[active] ? `${optionId}-${active}` : undefined}
              aria-label={label}
              onKeyDown={onListKey}
              style={{ left: anchor.left, top: anchor.top, width: anchor.width, maxHeight: anchor.maxHeight }}
              className="fixed z-[60] overflow-y-auto overscroll-contain rounded-xl bg-surface-raised p-1 shadow-[var(--shadow-pop)] ring-1 ring-line-soft focus:outline-none"
            >
              {options.map((option, at) => (
                <li
                  key={option.value}
                  id={`${optionId}-${at}`}
                  role="option"
                  aria-selected={option.value === current}
                  data-active={at === active}
                  onPointerEnter={() => setActive(at)}
                  onClick={() => pick(option)}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-[0.9375rem]",
                    at === active ? "bg-accent-quiet text-accent-text" : "text-fg",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === current ? <Check className="size-4 shrink-0" strokeWidth={2.5} aria-hidden /> : null}
                </li>
              ))}
            </ul>,
            host,
          )
        : null}
    </>
  );
}
