import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Long-form text.
 *
 * Only for legal pages and future articles: product sections build their own
 * hierarchy from tokens instead. Styling is applied with descendant selectors
 * so the content can eventually come from a CMS as plain HTML.
 */
export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-[68ch] text-fg-muted",
        "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-h3 [&_h2]:font-normal [&_h2]:text-fg",
        "[&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:text-h4 [&_h3]:font-medium [&_h3]:text-fg",
        "[&_p]:mb-4",
        "[&_ul]:mb-4 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2",
        "[&_li]:relative [&_li]:pl-5",
        "[&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.6875rem] [&_li]:before:size-1 [&_li]:before:rounded-full [&_li]:before:bg-line-strong [&_li]:before:content-['']",
        "[&_a]:text-fg [&_a]:underline [&_a]:decoration-line-strong [&_a]:underline-offset-4 hover:[&_a]:decoration-accent",
        "[&_strong]:font-medium [&_strong]:text-fg",
        className,
      )}
    >
      {children}
    </div>
  );
}
