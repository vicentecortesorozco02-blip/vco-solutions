import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * The compressed form of the signature diagram.
 *
 * Two rows of the same process: the one people run today, and the one a system
 * runs. The idea has to land before the visitor reads a word, so the second row
 * is literally shorter than the first. That is the entire argument of the
 * company, drawn.
 *
 * Chips wrap rather than scroll: a horizontal scroller at 360px hides half the
 * process, which would defeat the point.
 */

export interface RibbonNode {
  label: string;
  kind?: "step" | "system" | "edge";
}

interface RibbonRowProps {
  title: string;
  nodes: RibbonNode[];
  cost: string;
  variant: "manual" | "automated";
}

function Chip({ node, variant }: { node: RibbonNode; variant: RibbonRowProps["variant"] }) {
  const kind = node.kind ?? "step";

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-sm border px-2.5 py-1.5 text-xs transition-colors duration-[var(--duration-base)]",
        variant === "manual" && "border-line bg-transparent text-fg-muted",
        variant === "automated" && kind === "step" && "border-line-strong bg-surface text-fg",
        variant === "automated" && kind === "edge" && "border-line bg-transparent text-fg-muted",
        kind === "system" && "border-accent bg-accent text-accent-fg",
      )}
    >
      {node.label}
    </span>
  );
}

function RibbonRow({ title, nodes, cost, variant }: RibbonRowProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
      <p
        className={cn(
          "shrink-0 text-2xs font-medium uppercase tracking-[0.16em] lg:w-32",
          variant === "manual" ? "text-fg-subtle" : "text-accent-text",
        )}
      >
        {title}
      </p>

      <ol className="flex flex-1 flex-wrap items-center gap-x-1.5 gap-y-2">
        {nodes.map((node, index) => (
          <li key={node.label} className="flex items-center gap-1.5">
            {index > 0 ? (
              <ChevronRight
                aria-hidden
                className="size-3.5 shrink-0 text-fg-subtle"
                strokeWidth={1.5}
              />
            ) : null}
            <Chip node={node} variant={variant} />
          </li>
        ))}
      </ol>

      <p
        className={cn(
          "tnum shrink-0 text-sm lg:w-40 lg:text-right",
          variant === "manual" ? "text-fg-muted" : "font-medium text-fg",
        )}
      >
        {cost}
      </p>
    </div>
  );
}

interface ProcessRibbonProps {
  /** Names the example so no reader mistakes it for a client statistic. */
  caption: string;
  manual: { title: string; nodes: RibbonNode[]; cost: string };
  automated: { title: string; nodes: RibbonNode[]; cost: string };
  className?: string;
}

export function ProcessRibbon({
  caption,
  manual,
  automated,
  className,
}: ProcessRibbonProps) {
  return (
    <figure className={cn("flex flex-col gap-6", className)}>
      <figcaption className="flex items-center gap-3 border-t border-line pt-4 text-2xs uppercase tracking-[0.16em] text-fg-subtle">
        {caption}
      </figcaption>

      <div className="flex flex-col gap-6 lg:gap-5">
        <RibbonRow {...manual} variant="manual" />
        <div aria-hidden className="h-px w-full bg-line" />
        <RibbonRow {...automated} variant="automated" />
      </div>
    </figure>
  );
}
