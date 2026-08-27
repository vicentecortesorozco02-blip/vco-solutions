import Link from "next/link";

import { brand } from "@/config/brand";
import { routes } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Placeholder identity.
 *
 * There is no logo yet and inventing one would be worse than not having one.
 * The mark is a typographic lockup: a small accent square plus the name from
 * brand config. When naming and branding land, only this file changes.
 */
export function Wordmark({
  tone = "default",
  className,
}: {
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <Link
      href={routes.home}
      aria-label={`${brand.name} — inicio`}
      className={cn(
        "group inline-flex min-h-8 items-center gap-2.5 rounded-xs",
        className,
      )}
    >
      <span
        aria-hidden
        className="size-2.5 rotate-45 rounded-[1px] bg-accent transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quart)] group-hover:rotate-[135deg]"
      />
      <span
        className={cn(
          "text-[0.9375rem] font-medium tracking-[-0.01em]",
          tone === "inverse" ? "text-fg-inverse" : "text-fg",
        )}
      >
        {brand.name}
      </span>
    </Link>
  );
}
