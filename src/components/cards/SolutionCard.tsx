import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { SolutionSummary } from "@/content/types";
import { routes } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * A solution, as a cell in a hairline grid.
 *
 * Not a floating card: no shadow, no rounded container, no border of its own.
 * The grid gap is the border, which keeps six of these reading as one table
 * instead of six competing objects.
 */
export function SolutionCard({
  solution,
  className,
}: {
  solution: SolutionSummary;
  className?: string;
}) {
  const Icon = solution.icon;

  return (
    <Link
      href={routes.solution(solution.slug)}
      data-analytics-event="solution_card_click"
      data-analytics-id={solution.slug}
      className={cn(
        "group flex flex-col gap-5 bg-bg p-7 transition-colors duration-[var(--duration-base)] hover:bg-surface lg:p-8",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <Icon
          aria-hidden
          className="size-5 text-fg-muted transition-colors duration-[var(--duration-base)] group-hover:text-accent"
          strokeWidth={1.5}
        />
        <ArrowUpRight
          aria-hidden
          className="size-4 text-fg-subtle opacity-0 transition-all duration-[var(--duration-base)] ease-[var(--ease-out-quart)] group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
          strokeWidth={1.75}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="text-h4 font-medium text-fg">{solution.title}</h3>
        <p className="text-sm text-fg-muted">{solution.excerpt}</p>
      </div>

      <p className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-2 text-2xs uppercase tracking-[0.1em] text-fg-subtle">
        {solution.chain.map((step, index) => (
          <span key={step} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden>→</span> : null}
            {step}
          </span>
        ))}
      </p>
    </Link>
  );
}
