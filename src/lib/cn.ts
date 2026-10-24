import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with correct conflict resolution.
 *
 * Without this, a component that accepts `className` cannot be reliably
 * overridden: `px-4` and `px-6` both end up in the class list and which one
 * wins depends on stylesheet order, not on call site order.
 *
 * IMPORTANT — why the config exists.
 * Our type scale adds font sizes tailwind-merge has never heard of (`text-h2`,
 * `text-lead`, `text-metric`). Out of the box it classifies an unknown
 * `text-*` as a text *colour*, so `cn("text-h2", "text-fg")` silently deleted
 * the size and every section heading rendered at 16px. Any new key added to
 * the `--text-*` namespace in globals.css must be listed here too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["2xs", "lead", "h1", "h2", "h2-side", "h3", "h4", "list", "metric", "title", "stat"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
