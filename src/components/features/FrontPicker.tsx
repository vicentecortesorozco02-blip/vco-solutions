"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/cn";

export interface Front {
  slug: string;
  href: string;
  shortTitle: string;
  title: string;
  excerpt: string;
  chain: string[];
}

/**
 * The big uppercase list of the six fronts, as in YourHotelWeb's stay types.
 *
 * Desktop: hovering or focusing a word drives one panel with what we do there
 * and the chain of steps it replaces. Mobile and tablet: no hover, so every
 * front is a plain row with its sentence and link. Both are in the HTML from
 * the first paint; JavaScript only moves the highlight.
 */
export function FrontPicker({ items }: { items: Front[] }) {
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <>
      <div className="hidden gap-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center xl:gap-24">
        <ul>
          {items.map((item, index) => {
            const on = index === active;
            return (
              <li key={item.slug}>
                <button
                  type="button"
                  aria-pressed={on}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                  className={cn(
                    "type-display flex w-full items-baseline gap-5 py-[0.18em] text-left text-list transition-colors duration-[var(--duration-slow)]",
                    // Inactive words stay at 3:1: they are large text, and buttons.
                    on ? "text-fg" : "text-fg-quiet hover:text-fg-muted",
                  )}
                >
                  {item.shortTitle}
                  <span
                    aria-hidden
                    className={cn(
                      "h-px flex-1 origin-left bg-fg transition-transform duration-[var(--duration-scene)] ease-[var(--ease-out-soft)]",
                      on ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <div
          aria-live="polite"
          className="flex min-h-[26rem] flex-col justify-between gap-10 rounded-2xl bg-inverse p-10 text-fg-inverse xl:p-12"
        >
          <div className="flex flex-col gap-5">
            <p className="type-label tnum text-fg-inverse-muted">
              {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </p>
            <h3 className="type-display text-h3">{current.title}</h3>
            <p className="max-w-[40ch] text-lead text-fg-inverse-muted">{current.excerpt}</p>
          </div>

          <div className="flex flex-col gap-7">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
              {current.chain.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  {index > 0 ? (
                    <ArrowRight aria-hidden className="size-3.5 text-fg-inverse-quiet" strokeWidth={1.75} />
                  ) : null}
                  <span className="rounded-full border border-line-inverse px-3 py-1 text-xs text-fg-inverse">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <Link
              href={current.href}
              data-analytics-event="solution_card_click"
              data-analytics-id={current.slug}
              className="group/btn inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-fg-inverse underline-offset-4 hover:underline"
            >
              Ver la solución
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-[var(--duration-base)] group-hover/btn:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
          </div>
        </div>
      </div>

      <ul className="border-t border-line lg:hidden">
        {items.map((item) => (
          <li key={item.slug} className="border-b border-line">
            <Link
              href={item.href}
              data-analytics-event="solution_card_click"
              data-analytics-id={item.slug}
              className="flex flex-col gap-2 py-6"
            >
              <span className="flex items-center justify-between gap-4">
                <span className="type-display text-h3 text-fg">{item.shortTitle}</span>
                <ArrowRight aria-hidden className="size-5 shrink-0 text-fg-subtle" strokeWidth={1.75} />
              </span>
              <span className="max-w-[46ch] text-[0.9375rem] text-fg-muted">{item.excerpt}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
