import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { AnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "quiet" | "inverse" | "light";
type Size = "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "tracking-[-0.01em] whitespace-nowrap transition-[background-color,color,box-shadow,transform] " +
  "duration-[var(--duration-base)] ease-[var(--ease-out-soft)] active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-55";

const variants: Record<Variant, string> = {
  /** The dominant action. One per view. */
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  /** An outlined pill: everything that is not the dominant action. */
  secondary: "text-fg ring-1 ring-inset ring-line-field hover:ring-fg",
  quiet: "text-fg hover:bg-bg-sunken",
  /** Outlined pill on the dark block. */
  inverse:
    "text-fg-inverse ring-1 ring-inset ring-fg-inverse-quiet hover:ring-fg-inverse",
  /** The dominant action on the dark block: a paper pill. */
  light: "bg-surface text-fg hover:bg-accent-quiet",
};

const sizes: Record<Size, string> = {
  /** 44px tall: the minimum comfortable touch target. */
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-[3.25rem] px-6 text-[0.9375rem]",
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
 * The only button in the system. Pills, as in YourHotelWeb.
 *
 * There is one dominant action per view. `primary` is reserved for it (or
 * `light` on the dark block). Everything else is `secondary` or `quiet`. This component is server-safe:
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
