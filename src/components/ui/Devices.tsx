import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Device frames drawn in CSS, the same idea as YourHotelWeb.
 *
 * The screens are real screenshots of delivered work (public/trabajos/), so a
 * mockup can never show something we have not built. The frame proportions
 * are written in container units (`cqw`) because they are the geometry of a
 * drawing, not sizes of the design system: a laptop bezel has to stay a
 * laptop bezel at 300 px and at 900 px.
 */

interface ScreenProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
}

function Screen({ src, alt, priority, sizes }: ScreenProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      quality={85}
      className="object-cover object-top"
    />
  );
}

export function Laptop({ className, ...screen }: ScreenProps & { className?: string }) {
  return (
    <div className={cn("[container-type:inline-size]", className)}>
      <div className="mx-[7%] rounded-t-[1.5cqw] bg-device p-[1cqw] pb-[1.2cqw]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[0.5cqw] bg-device-screen">
          <Screen {...screen} />
        </div>
      </div>
      <div className="relative h-[1.5cqw] rounded-b-[1.5cqw] rounded-t-[0.15cqw] bg-linear-to-b from-device-base to-device-base-shade shadow-[var(--shadow-device)]">
        <div className="absolute left-1/2 top-0 h-[40%] w-[12%] -translate-x-1/2 rounded-b-[0.6cqw] bg-device-base-shade" />
      </div>
    </div>
  );
}

export function Phone({ className, ...screen }: ScreenProps & { className?: string }) {
  return (
    <div className={cn("[container-type:inline-size]", className)}>
      <div className="rounded-[15cqw] bg-device p-[3.6cqw] shadow-[var(--shadow-device)]">
        <div className="relative aspect-[390/844] overflow-hidden rounded-[11.5cqw] bg-device-screen">
          <Screen {...screen} />
          <div className="absolute left-1/2 top-[1.6%] h-[2.6%] w-[28%] -translate-x-1/2 rounded-full bg-device-screen" />
        </div>
      </div>
    </div>
  );
}

/** Minimal browser chrome for wide screenshots. */
export function Browser({
  className,
  label,
  children,
}: {
  className?: string;
  /** The address shown in the bar. */
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-surface ring-1 ring-line", className)}>
      <div className="flex h-8 items-center gap-1.5 bg-bg-subtle px-3">
        {[0, 1, 2].map((dot) => (
          <span key={dot} aria-hidden className="size-2 rounded-full bg-line-strong" />
        ))}
        {label ? (
          <span className="type-label mx-auto max-w-[60%] truncate pr-9 text-fg-subtle">
            {label}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
