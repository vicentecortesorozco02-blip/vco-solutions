import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { type PaymentState, paymentStateLabel, type Total } from "@/lib/life/finance";
import { formatMoney } from "@/lib/life/money";
import { type Confidence, confidenceShort, type TagColor } from "@/lib/life/model";

/**
 * The panel's building blocks. Apple-style grouped layout: a soft canvas,
 * white cards without borders, big numbers, little text.
 */

export function PageHeader({
  title,
  question,
  actions,
}: {
  title: string;
  /** The one question this screen answers. Shown under the title. */
  question?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-title font-semibold tracking-[-0.025em] text-fg">{title}</h1>
        {question ? <p className="text-sm text-fg-muted">{question}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Card({
  children,
  className,
  as: Tag = "section",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "li";
} & Record<`aria-${string}`, string | undefined>) {
  return (
    <Tag className={cn("rounded-2xl bg-surface p-5 sm:p-6", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardTitle({
  children,
  href,
  icon: Icon,
  action,
}: {
  children: ReactNode;
  href?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  const label = (
    <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.06em] text-fg-subtle uppercase">
      {Icon ? <Icon className="size-4" strokeWidth={2} aria-hidden /> : null}
      {children}
    </span>
  );
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      {href ? (
        <Link href={href} className="rounded-md transition-colors hover:text-fg [&>span]:hover:text-fg">
          {label}
        </Link>
      ) : (
        <h2>{label}</h2>
      )}
      {action}
    </div>
  );
}

/** A tile on the home screen: label, one big number, one line of context. */
export function StatTile({
  label,
  value,
  detail,
  href,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  href: string;
  icon: LucideIcon;
  tone?: "default" | "critical" | "caution";
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-36 flex-col justify-between gap-4 rounded-2xl bg-surface p-5 transition-[transform,background-color] duration-[var(--duration-base)] ease-[var(--ease-out-soft)] hover:bg-surface-raised active:scale-[0.99]"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-[0.06em] text-fg-subtle uppercase">{label}</span>
        <Icon
          className={cn(
            "size-5 shrink-0",
            tone === "critical" ? "text-critical" : tone === "caution" ? "text-caution" : "text-fg-quiet",
          )}
          strokeWidth={1.75}
          aria-hidden
        />
      </span>
      <span className="flex flex-col gap-1">
        <span className="tnum text-stat font-semibold tracking-[-0.03em] text-fg">{value}</span>
        {detail ? <span className="text-sm text-fg-muted">{detail}</span> : null}
      </span>
    </Link>
  );
}

/** A figure that is not a link: label, big number, one line. */
export function StatCard({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "default" | "positive" | "critical";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-surface p-5">
      <span className="text-xs font-semibold tracking-[0.06em] text-fg-subtle uppercase">{label}</span>
      <span
        className={cn(
          "tnum text-stat font-semibold tracking-[-0.03em]",
          tone === "positive" ? "text-positive" : tone === "critical" ? "text-critical" : "text-fg",
        )}
      >
        {value}
      </span>
      {detail ? <span className="text-sm text-fg-muted">{detail}</span> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-fill text-fg-muted">
        <Icon className="size-6" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="text-base font-semibold text-fg">{title}</p>
      {children ? <p className="max-w-[40ch] text-sm text-fg-muted">{children}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "positive" | "caution" | "critical";
  className?: string;
}) {
  const tones = {
    neutral: "bg-fill text-fg-muted",
    accent: "bg-accent-quiet text-accent-text",
    positive: "bg-positive-quiet text-positive",
    caution: "bg-caution-quiet text-caution",
    critical: "bg-critical-quiet text-critical",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className="h-1.5 w-full overflow-hidden rounded-full bg-fill-strong"
    >
      <div className="h-full rounded-full bg-accent" style={{ width: `${clamped}%` }} />
    </div>
  );
}

/** Pill-shaped link used as the secondary action of a page header. */
export function HeaderLink({
  href,
  children,
  icon: Icon,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  icon?: LucideIcon;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
        primary ? "bg-accent text-accent-fg hover:bg-accent-hover" : "bg-surface text-fg hover:bg-surface-raised",
      )}
    >
      {Icon ? <Icon className="size-4" strokeWidth={2} aria-hidden /> : null}
      {children}
    </Link>
  );
}

/** Tabs that are links: ?vista=hoy. The current one is marked for AT. */
export function ViewTabs({
  tabs,
  current,
  label,
}: {
  tabs: { key: string; label: string; href: string; count?: number }[];
  current: string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="-mx-1 overflow-x-auto px-1">
      <ul className="inline-flex gap-1 rounded-full bg-fill p-1">
        {tabs.map((tab) => {
          const active = tab.key === current;
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "bg-surface text-fg shadow-[var(--shadow-raise)]" : "text-fg-muted hover:text-fg",
                )}
              >
                {tab.label}
                {tab.count !== undefined ? (
                  <span className="tnum text-xs text-fg-subtle">{tab.count}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** A row in a grouped list. Links to the record's editor. */
export function Row({
  href,
  icon: Icon,
  iconColor,
  title,
  detail,
  trailing,
  leading,
  muted = false,
}: {
  href: string;
  icon?: LucideIcon;
  /** Tints the icon bubble, e.g. with the project's colour. */
  iconColor?: TagColor;
  title: ReactNode;
  detail?: ReactNode;
  trailing?: ReactNode;
  /** Replaces the icon, e.g. a checkbox. Sits outside the link. */
  leading?: ReactNode;
  muted?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 px-4 sm:px-5">
      {leading ??
        (Icon ? (
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full",
              iconColor ? tagClass(iconColor) : "bg-fill text-fg-muted",
            )}
          >
            <Icon className="size-[1.125rem]" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null)}
      <Link
        href={href}
        scroll={false}
        className="flex min-h-14 min-w-0 flex-1 items-center justify-between gap-3 border-b border-line-soft py-3"
      >
        <span className="flex min-w-0 flex-col">
          <span className={cn("truncate text-[0.9375rem] font-medium", muted ? "text-fg-subtle line-through" : "text-fg")}>
            {title}
          </span>
          {detail ? <span className="truncate text-sm text-fg-muted">{detail}</span> : null}
        </span>
        {trailing ? <span className="flex shrink-0 items-center gap-2">{trailing}</span> : null}
      </Link>
    </li>
  );
}

/** Wraps Rows. The last row loses its divider. */
export function RowList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ul className={cn("overflow-hidden rounded-2xl bg-surface py-1 [&>li:last-child>a]:border-b-0", className)}>
      {children}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Money, and how sure we are of it
// ---------------------------------------------------------------------------

/**
 * A figure that may not be known.
 *
 * An unknown amount reads "Pendiente de confirmar": it is never a 0 €, and
 * never a number dressed up as certain. Anything that is not confirmed
 * carries a word saying so, because colour alone must not carry meaning.
 */
export function Amount({
  value,
  confidence,
  round = false,
  className,
}: {
  value: number | null;
  confidence?: Confidence;
  round?: boolean;
  className?: string;
}) {
  if (value === null || confidence === "unknown") {
    return <span className={cn("text-sm text-fg-muted", className)}>Pendiente de confirmar</span>;
  }
  return (
    <span className={cn("flex flex-col items-end gap-0.5", className)}>
      <span className="tnum font-semibold text-fg">{formatMoney(value, { round })}</span>
      {confidence && confidence !== "confirmed" ? (
        <span className="text-xs text-fg-subtle">{confidenceShort[confidence]}</span>
      ) : null}
    </span>
  );
}

/**
 * A total that separates confirmed figures from estimates and says how many
 * it could not add at all.
 */
export function TotalValue({ total, round = false }: { total: Total; round?: boolean }) {
  const parts = [
    total.estimated > 0 ? `${formatMoney(total.estimated, { round })} estimado` : null,
    total.unknown > 0 ? `${total.unknown} sin importe` : null,
  ].filter(Boolean);
  return (
    <>
      <span className="tnum">{formatMoney(total.confirmed + total.estimated, { round })}</span>
      {parts.length ? <span className="mt-1 block text-sm font-normal text-fg-muted">{parts.join(" · ")}</span> : null}
    </>
  );
}

const stateTone: Record<PaymentState, "neutral" | "accent" | "positive" | "caution" | "critical"> = {
  paid: "positive",
  forecast: "accent",
  unchecked: "caution",
  failed: "critical",
  cancelled: "neutral",
  pending: "caution",
};

/**
 * A total on one line: the figure, or how many items have no figure when
 * there is nothing to add. Never a 0 € standing in for "no lo sé".
 */
export function TotalLine({ total }: { total: Total }) {
  const value = total.confirmed + total.estimated;
  if (value === 0 && total.unknown > 0) {
    return (
      <span className="text-sm text-fg-muted">
        {total.unknown} sin importe comparable
      </span>
    );
  }
  return (
    <span className="tnum font-semibold text-fg">
      {formatMoney(value)}
      {total.unknown > 0 ? <span className="ml-2 text-xs font-normal text-fg-subtle">+{total.unknown} sin importe</span> : null}
    </span>
  );
}

/** What happened with a payment, in a word. Never colour on its own. */
export function PaymentStateChip({ state }: { state: PaymentState }) {
  return <Pill tone={stateTone[state]}>{paymentStateLabel[state]}</Pill>;
}

/**
 * A compact figure. Six of these fit on one line without taking the screen
 * hostage: the week below them is what you came to see.
 */
export function MiniStat({
  label,
  value,
  detail,
  href,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  href: string;
  icon: LucideIcon;
  tone?: "default" | "critical" | "caution";
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-20 flex-col justify-center gap-0.5 rounded-2xl bg-surface px-4 py-3 transition-colors hover:bg-surface-raised"
    >
      <span className="flex items-center gap-1.5 text-xs font-medium text-fg-subtle">
        <Icon
          className={cn(
            "size-3.5 shrink-0",
            tone === "critical" ? "text-critical" : tone === "caution" ? "text-caution" : "text-fg-quiet",
          )}
          strokeWidth={2}
          aria-hidden
        />
        <span className="truncate">{label}</span>
      </span>
      <span
        className={cn(
          "tnum truncate text-xl font-semibold tracking-[-0.02em]",
          tone === "critical" ? "text-critical" : "text-fg",
        )}
      >
        {value}
      </span>
      {detail ? <span className="truncate text-xs text-fg-muted">{detail}</span> : null}
    </Link>
  );
}

const tagText: Record<TagColor, string> = {
  slate: "text-tag-slate",
  mint: "text-tag-mint",
  sky: "text-tag-sky",
  violet: "text-tag-violet",
  amber: "text-tag-amber",
  rose: "text-tag-rose",
  teal: "text-tag-teal",
  sand: "text-tag-sand",
};

const tagFill: Record<TagColor, string> = {
  slate: "bg-tag-slate",
  mint: "bg-tag-mint",
  sky: "bg-tag-sky",
  violet: "bg-tag-violet",
  amber: "bg-tag-amber",
  rose: "bg-tag-rose",
  teal: "bg-tag-teal",
  sand: "bg-tag-sand",
};

const tagQuiet: Record<TagColor, string> = {
  slate: "bg-tag-slate-quiet text-tag-slate",
  mint: "bg-tag-mint-quiet text-tag-mint",
  sky: "bg-tag-sky-quiet text-tag-sky",
  violet: "bg-tag-violet-quiet text-tag-violet",
  amber: "bg-tag-amber-quiet text-tag-amber",
  rose: "bg-tag-rose-quiet text-tag-rose",
  teal: "bg-tag-teal-quiet text-tag-teal",
  sand: "bg-tag-sand-quiet text-tag-sand",
};

/** Classes for a colour label. The name always travels with it. */
export const tagClass = (color: TagColor, as: "text" | "fill" | "quiet" = "quiet") =>
  as === "text" ? tagText[color] : as === "fill" ? tagFill[color] : tagQuiet[color];

/** A small dot plus a name: a project at a glance, readable in grey too. */
export function TagDot({ color, children }: { color: TagColor; children?: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className={cn("size-2 shrink-0 rounded-full", tagFill[color])} aria-hidden />
      {children ? <span className="truncate">{children}</span> : null}
    </span>
  );
}
