import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  /** Optional marker: "01", "02". Printed in the label, before the eyebrow. */
  index?: string;
  /** Small mono label above the headline. Omit it when the headline says it all. */
  eyebrow?: string;
  /**
   * The headline. Pass two lines as an array to get the two-tone treatment:
   * the first line states the point, the second, quieter, lands it.
   */
  title: ReactNode | readonly string[];
  /** One sentence. If it needs two, the section is doing too much. */
  lead?: ReactNode;
  /** A single action, under the lead. Never two. */
  action?: ReactNode;
  tone?: "default" | "inverse";
  align?: "start" | "center";
  /**
   * `h2` by default. `h1` for the opening block of a page. `side` when the
   * header sits in a side column next to body text.
   */
  size?: "h2" | "h1" | "side";
  className?: string;
  as?: "h2" | "h1";
}

/**
 * The one heading pattern used by every section.
 *
 * A wide uppercase headline on the left and, on wide screens, the lead and the
 * action on the right, aligned to its last line. Sections must not invent
 * their own heading treatment.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lead,
  action,
  tone = "default",
  align = "start",
  size = "h2",
  className,
  as: Heading = "h2",
}: SectionHeaderProps) {
  const inverse = tone === "inverse";
  const centered = align === "center";
  const side = lead || action;

  return (
    <header
      className={cn(
        "grid grid-cols-1 gap-7",
        !centered && side && "lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-end lg:gap-16",
        centered && "justify-items-center text-center",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-6", centered && "items-center")}>
        {eyebrow ? (
          <p
            className={cn(
              "type-label flex items-center gap-3",
              inverse ? "text-fg-inverse-muted" : "text-fg-subtle",
            )}
          >
            {index ? (
              <span className={cn("tnum", inverse ? "text-fg-inverse" : "text-accent-text")}>
                {index}
              </span>
            ) : null}
            <span>{eyebrow}</span>
          </p>
        ) : null}

        <Heading
          className={cn(
            "type-display",
            size === "h1" ? "text-h1" : size === "side" ? "text-h2-side" : "text-h2",
            centered ? "max-w-[20ch]" : "max-w-[18ch]",
            inverse ? "text-fg-inverse" : "text-fg",
          )}
        >
          <TitleLines title={title} inverse={inverse} />
        </Heading>
      </div>

      {side ? (
        <div className={cn("flex flex-col gap-6", centered ? "items-center" : "items-start")}>
          {lead ? (
            <p
              className={cn(
                "max-w-[34rem] text-lead",
                inverse ? "text-fg-inverse-muted" : "text-fg-muted",
              )}
            >
              {lead}
            </p>
          ) : null}
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
    </header>
  );
}

/**
 * Renders a headline. An array becomes one block per line with every line
 * after the first set quieter; anything else is rendered as it comes.
 *
 * Exported because the hero and the closing call to action use the same
 * treatment at a different size.
 */
export function TitleLines({
  title,
  inverse = false,
}: {
  title: ReactNode | readonly string[];
  inverse?: boolean;
}) {
  if (!Array.isArray(title)) return <>{title as ReactNode}</>;

  return (
    <>
      {(title as readonly string[]).map((line, index) => (
        <span
          key={line}
          className={cn(
            "block",
            index > 0 && (inverse ? "text-fg-inverse-quiet" : "text-fg-quiet"),
          )}
        >
          {/* The trailing space keeps the words apart when read as plain text. */}
          {line}{" "}
        </span>
      ))}
    </>
  );
}
