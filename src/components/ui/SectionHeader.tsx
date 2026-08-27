import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  /** Editorial marker: "01", "02". Numbering runs across the whole page. */
  index?: string;
  eyebrow: string;
  title: ReactNode;
  /** One sentence. If it needs two, the section is doing too much. */
  lead?: ReactNode;
  /** A single action, aligned right on wide screens. Never two. */
  action?: ReactNode;
  tone?: "default" | "inverse";
  align?: "start" | "center";
  className?: string;
  as?: "h2" | "h1";
}

/**
 * The one heading pattern used by every section.
 *
 * Numbering plus a hairline gives the page the feel of a document rather than
 * a deck. Sections must not invent their own heading treatment.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lead,
  action,
  tone = "default",
  align = "start",
  className,
  as: Heading = "h2",
}: SectionHeaderProps) {
  const inverse = tone === "inverse";

  return (
    <header
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-t pt-4 text-2xs font-medium uppercase tracking-[0.16em]",
          align === "center" ? "self-stretch justify-center" : "self-stretch",
          inverse ? "border-line-inverse text-fg-inverse-muted" : "border-line text-fg-subtle",
        )}
      >
        {index ? (
          <span className={cn("tnum", inverse ? "text-fg-inverse" : "text-accent-text")}>
            {index}
          </span>
        ) : null}
        <span>{eyebrow}</span>
      </div>

      <div
        className={cn(
          "flex flex-col gap-5",
          align === "start" && action
            ? "lg:flex-row lg:items-end lg:justify-between lg:gap-12"
            : null,
        )}
      >
        <div className={cn("flex flex-col gap-4", align === "center" && "items-center")}>
          <Heading
            className={cn(
              "font-display text-h2 font-normal tracking-[-0.01em]",
              align === "center" ? "max-w-[22ch]" : "max-w-[20ch]",
              inverse ? "text-fg-inverse" : "text-fg",
            )}
          >
            {title}
          </Heading>

          {lead ? (
            <p
              className={cn(
                "text-lead max-w-[52ch]",
                inverse ? "text-fg-inverse-muted" : "text-fg-muted",
              )}
            >
              {lead}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
