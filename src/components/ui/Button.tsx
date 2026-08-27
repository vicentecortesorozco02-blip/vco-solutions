import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { AnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "quiet" | "inverse";
type Size = "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-sm font-medium " +
  "tracking-[-0.005em] whitespace-nowrap transition-[background-color,border-color,color,box-shadow] " +
  "duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] " +
  "disabled:pointer-events-none disabled:opacity-55";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg shadow-[0_1px_0_oklch(1_0_0/0.18)_inset] hover:bg-accent-hover",
  secondary:
    "border border-line-strong bg-surface text-fg hover:border-fg hover:bg-bg-subtle",
  quiet: "text-fg hover:bg-bg-sunken",
  inverse:
    "border border-line-inverse bg-transparent text-fg-inverse hover:border-fg-inverse-muted hover:bg-white/5",
};

const sizes: Record<Size, string> = {
  /** 44px tall: the minimum comfortable touch target. */
  md: "min-h-11 px-5 text-[0.9375rem]",
  lg: "min-h-[3.25rem] px-7 text-base",
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Fills the row on mobile. Buttons should be full width below 430px. */
  block?: boolean;
  /** Instrumentation, read by the delegated listener in AnalyticsBridge. */
  event?: AnalyticsEvent;
  eventLocation?: string;
  eventId?: string;
}

type AnchorProps = CommonProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;

type NativeButtonProps = CommonProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export type ButtonProps = AnchorProps | NativeButtonProps;

/**
 * The only button in the system.
 *
 * There is one dominant action per view. `primary` is reserved for it.
 * Everything else is `secondary` or `quiet`. This component is server-safe:
 * click tracking happens through data attributes, not an onClick handler, so
 * a CTA never forces a client bundle.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  block = false,
  event,
  eventLocation,
  eventId,
  ...rest
}: ButtonProps) {
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    block ? "w-full" : "w-auto",
    className,
  );

  const analytics = event
    ? {
        "data-analytics-event": event,
        ...(eventLocation ? { "data-analytics-location": eventLocation } : {}),
        ...(eventId ? { "data-analytics-id": eventId } : {}),
      }
    : {};

  if ("href" in rest && rest.href) {
    const { href, ...anchorProps } = rest as AnchorProps;
    const external = href.startsWith("http") || href.startsWith("mailto:");

    if (external) {
      return (
        <a
          href={href}
          className={classes}
          rel="noreferrer noopener"
          {...analytics}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...analytics} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as NativeButtonProps;
  return (
    <button type="button" className={classes} {...analytics} {...buttonProps}>
      {children}
    </button>
  );
}
