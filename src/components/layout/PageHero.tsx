import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

export interface Crumb {
  name: string;
  path: string;
}

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Last crumb is the current page and is rendered as plain text. */
  crumbs?: Crumb[];
  /** Optional slot under the lead: CTAs, a badge, a metric row. */
  children?: ReactNode;
  /** Optional column on the right at lg and up. */
  aside?: ReactNode;
  className?: string;
}

/**
 * The opening block of every page that is not the home page.
 *
 * Shared so that inner pages cannot drift into having five different heading
 * treatments. Breadcrumbs are visible, not only structured data: on a site
 * with nested solutions and cases they are genuine navigation.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
  aside,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("relative border-b border-line", className)}>
      <Container className="pb-[clamp(2.75rem,2rem+2.5vw,4.5rem)] pt-[clamp(2.25rem,1.5rem+3vw,4rem)]">
        {crumbs && crumbs.length > 0 ? (
          <nav aria-label="Migas de pan" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-fg-subtle">
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1;
                return (
                  <li key={crumb.path} className="flex items-center gap-2">
                    {index > 0 ? <span aria-hidden>/</span> : null}
                    {last ? (
                      <span aria-current="page" className="text-fg-muted">
                        {crumb.name}
                      </span>
                    ) : (
                      <Link href={crumb.path} className="transition-colors hover:text-fg">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <div
          className={cn(
            "grid grid-cols-1 gap-10",
            aside ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20" : null,
          )}
        >
          <div className="flex flex-col gap-6">
            <p className="text-2xs font-medium uppercase tracking-[0.18em] text-fg-subtle">
              {eyebrow}
            </p>

            <h1 className="max-w-[20ch] font-display text-h1 font-normal tracking-[-0.015em] text-fg">
              {title}
            </h1>

            {lead ? (
              <p className="max-w-[58ch] text-lead text-fg-muted">{lead}</p>
            ) : null}

            {children ? <div className="pt-2">{children}</div> : null}
          </div>

          {aside ? <div className="lg:pt-2">{aside}</div> : null}
        </div>
      </Container>
    </section>
  );
}
