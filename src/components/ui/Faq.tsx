import { Plus } from "lucide-react";

import type { FaqItem } from "@/content/types";
import { cn } from "@/lib/cn";

interface FaqProps {
  items: FaqItem[];
  className?: string;
}

/**
 * FAQ list.
 *
 * Built on native `<details>`: keyboard accessible, findable by browser
 * in-page search, works without JavaScript, and costs nothing in the bundle.
 * The marker rotates on open, which is the whole animation budget this
 * component needs.
 */
export function Faq({ items, className }: FaqProps) {
  return (
    <div className={cn("border-t border-line", className)}>
      {items.map((item) => (
        <details
          key={item.id}
          className="group border-b border-line"
          data-analytics-event="faq_open"
          data-analytics-id={item.id}
        >
          <summary
            className={cn(
              "flex cursor-pointer list-none items-start justify-between gap-6 py-5",
              "text-h4 font-medium text-fg transition-colors duration-[var(--duration-fast)]",
              "hover:text-accent-text [&::-webkit-details-marker]:hidden",
            )}
          >
            <span className="max-w-[46ch]">{item.question}</span>
            <span
              aria-hidden
              className="mt-1 flex size-6 shrink-0 items-center justify-center text-fg-subtle transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quart)] group-open:rotate-45"
            >
              <Plus className="size-[1.125rem]" strokeWidth={1.5} />
            </span>
          </summary>

          <p className="max-w-[62ch] pb-6 pr-10 text-fg-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
