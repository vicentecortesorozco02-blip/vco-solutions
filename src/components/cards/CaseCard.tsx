import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { DemonstrationBadge } from "@/components/ui/Metric";
import { routes } from "@/config/site";
import type { CaseSummary } from "@/content/types";
import { cn } from "@/lib/cn";

export function CaseCard({
  entry,
  className,
}: {
  entry: CaseSummary;
  className?: string;
}) {
  return (
    <Link
      href={routes.case(entry.slug)}
      data-analytics-event="case_card_click"
      data-analytics-id={entry.slug}
      className={cn(
        "group flex flex-col gap-6 bg-bg p-7 transition-colors duration-[var(--duration-base)] hover:bg-surface lg:p-8",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-2xs uppercase tracking-[0.14em] text-fg-subtle">
          {entry.sector}
        </span>
        <ArrowUpRight
          aria-hidden
          className="size-4 text-fg-subtle opacity-0 transition-all duration-[var(--duration-base)] ease-[var(--ease-out-quart)] group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
          strokeWidth={1.75}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="font-display text-h3 font-normal text-fg">{entry.title}</h3>
        <p className="text-sm text-fg-muted">{entry.excerpt}</p>
      </div>

      <div className="mt-auto flex flex-col gap-4 border-t border-line pt-5">
        <div className="flex flex-col gap-1">
          <p className="tnum text-h4 font-medium text-fg">{entry.headline.value}</p>
          <p className="text-2xs text-fg-subtle">{entry.headline.label}</p>
        </div>
        {entry.kind === "demonstration" ? <DemonstrationBadge /> : null}
      </div>
    </Link>
  );
}
