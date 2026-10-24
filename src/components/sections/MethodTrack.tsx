"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/cn";
import { methodPhases } from "@/content/method";

/**
 * Las cinco fases como un recorrido.
 *
 * Una línea de progreso con cinco paradas: se elige una y debajo aparece lo
 * que se hace en ella y lo que el cliente recibe. Es la misma información que
 * la lista del método, contada de la forma en que se entiende de un vistazo.
 *
 * Accesibilidad antes que efecto: pestañas con flechas de teclado, foco
 * visible, y el relleno de la línea es una transición de ancho que respeta
 * `prefers-reduced-motion` desde el CSS global.
 */
export function MethodTrack({ className }: { className?: string }) {
  const groupId = useId();
  const [active, setActive] = useState(0);
  const phase = methodPhases[active];
  const progress = (active / (methodPhases.length - 1)) * 100;

  const move = (delta: number) => {
    const next = (active + delta + methodPhases.length) % methodPhases.length;
    setActive(next);
    document.getElementById(`${groupId}-tab-${next}`)?.focus();
  };

  return (
    <div className={cn("flex flex-col gap-10", className)}>
      <div
        role="tablist"
        aria-label="Fases del método"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            move(-1);
          }
          if (event.key === "Home") {
            event.preventDefault();
            setActive(0);
          }
          if (event.key === "End") {
            event.preventDefault();
            setActive(methodPhases.length - 1);
          }
        }}
        className="relative"
      >
        {/* La vía. Decorativa: el estado real lo dice aria-selected. */}
        <div aria-hidden className="absolute inset-x-0 top-[0.4375rem] hidden h-px bg-line-strong sm:block">
          <div
            className="h-px bg-fg transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="relative grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-5">
          {methodPhases.map((item, index) => {
            const selected = index === active;
            const done = index <= active;
            return (
              <li key={item.number}>
                <button
                  type="button"
                  role="tab"
                  id={`${groupId}-tab-${index}`}
                  aria-selected={selected}
                  aria-controls={`${groupId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(index)}
                  className="group/phase flex w-full items-center gap-3 py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:flex-col sm:items-start"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-[0.875rem] shrink-0 rounded-full ring-1 transition-colors duration-[var(--duration-base)]",
                      done ? "bg-fg ring-fg" : "bg-bg ring-line-strong",
                      selected && "ring-2 ring-offset-2 ring-offset-bg",
                    )}
                  />
                  <span className="flex flex-col gap-0.5 sm:pt-3">
                    <span className="type-label tnum text-fg-subtle">{item.number}</span>
                    <span
                      className={cn(
                        "type-display text-h4 transition-colors duration-[var(--duration-base)]",
                        selected ? "text-fg" : "text-fg-muted group-hover/phase:text-fg",
                      )}
                    >
                      {item.title}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div
        id={`${groupId}-panel`}
        role="tabpanel"
        aria-labelledby={`${groupId}-tab-${active}`}
        className="grid grid-cols-1 gap-8 border-t border-line pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16"
      >
        <div className="flex flex-col gap-4">
          <p className="text-lead text-fg">{phase.summary}</p>
          <div className="flex flex-col gap-1.5">
            <p className="type-label text-fg-subtle">Qué recibes al acabar la fase</p>
            <p className="text-[0.9375rem] text-fg">{phase.deliverable}</p>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {phase.detail.map((line) => (
            <li key={line} className="flex gap-3 border-t border-line py-3 text-sm text-fg-muted">
              <span aria-hidden className="text-fg-subtle">
                ·
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
