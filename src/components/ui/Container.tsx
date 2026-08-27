import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Width = "content" | "page" | "wide" | "full";

const widths: Record<Width, string> = {
  /** Long-form reading measure, ~70 characters. */
  content: "max-w-[var(--container-content)]",
  /** The primary grid. Everything sits on this unless there is a reason. */
  page: "max-w-[var(--container-page)]",
  /** Full-bleed panels and edge-to-edge diagrams. */
  wide: "max-w-[var(--container-wide)]",
  full: "max-w-none",
};

interface ContainerProps {
  children: ReactNode;
  width?: Width;
  as?: ElementType;
  className?: string;
}

/**
 * Horizontal rhythm.
 *
 * The gutter is a single fluid token, so the distance from content to screen
 * edge is identical on every page at every width. Do not add `px-*` to page
 * sections: use a Container.
 */
export function Container({
  children,
  width = "page",
  as: Tag = "div",
  className,
}: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full u-gutter", widths[width], className)}>
      {children}
    </Tag>
  );
}
