"use client";

import { CalendarRange, Ellipsis, Inbox, LogOut, Settings, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { signOut } from "@/app/panel/actions";
import { panelNav, panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";

import { navIcon } from "./icons";

function isActive(pathname: string, href: string): boolean {
  return href === panelRoutes.home ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

const extras = [
  { key: "ai", label: "IA", href: panelRoutes.ai, icon: Sparkles },
  { key: "inbox", label: "Inbox", href: panelRoutes.inbox, icon: Inbox },
  { key: "dates", label: "Fechas importantes", href: panelRoutes.dates, icon: CalendarRange },
] as const;

/** Sidebar navigation, from 1024 px. */
export function SidebarNav({ inboxCount }: { inboxCount: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel" className="flex flex-col gap-6">
      <ul className="flex flex-col gap-0.5">
        {panelNav.map((item) => {
          const Icon = navIcon[item.key];
          const active = isActive(pathname, item.href);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-medium transition-colors",
                  active ? "bg-surface text-fg shadow-[var(--shadow-raise)]" : "text-fg-muted hover:bg-fill hover:text-fg",
                )}
              >
                <Icon className={cn("size-[1.125rem]", active && "text-accent-text")} strokeWidth={1.9} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <ul className="flex flex-col gap-0.5 border-t border-line pt-4">
        {extras.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                  active ? "bg-surface text-fg shadow-[var(--shadow-raise)]" : "text-fg-muted hover:bg-fill hover:text-fg",
                )}
              >
                <item.icon className="size-[1.125rem]" strokeWidth={1.9} aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.key === "inbox" && inboxCount > 0 ? (
                  <span className="tnum rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-fg">
                    {inboxCount}
                    <span className="sr-only"> sin procesar</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const tabKeys = ["home", "calendar", "tasks", "money"] as const;

/** Bottom tab bar under 1024 px: four destinations and "Más". */
export function TabBar({ inboxCount }: { inboxCount: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sheet = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = sheet.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);


  const tabs = panelNav.filter((item) => (tabKeys as readonly string[]).includes(item.key));
  const rest = panelNav.filter((item) => !(tabKeys as readonly string[]).includes(item.key));
  const moreActive = [...rest, ...extras].some((item) => isActive(pathname, item.href));

  return (
    <>
      <nav
        aria-label="Panel"
        className="fixed inset-x-0 bottom-0 z-[var(--z-header)] border-t border-line-soft bg-canvas/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {tabs.map((item) => {
            const Icon = navIcon[item.key];
            const active = isActive(pathname, item.href);
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  prefetch
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium",
                    active ? "text-accent-text" : "text-fg-subtle",
                  )}
                >
                  <Icon className="size-[1.375rem]" strokeWidth={active ? 2.1 : 1.8} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              className={cn(
                "relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium",
                moreActive ? "text-accent-text" : "text-fg-subtle",
              )}
            >
              <Ellipsis className="size-[1.375rem]" strokeWidth={1.8} aria-hidden />
              Más
              {inboxCount > 0 ? (
                <span className="absolute top-2 right-[calc(50%-1.1rem)] size-2 rounded-full bg-accent" aria-hidden />
              ) : null}
            </button>
          </li>
        </ul>
      </nav>

      <dialog
        ref={sheet}
        aria-label="Más secciones"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === sheet.current) setOpen(false);
        }}
        className="m-0 mt-auto w-full max-w-none rounded-t-[1.75rem] bg-surface p-0 text-fg backdrop:bg-scrim lg:hidden"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <p className="text-lg font-semibold">Más</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="grid size-9 place-items-center rounded-full bg-fill text-fg-muted"
          >
            <X className="size-4" strokeWidth={2.25} aria-hidden />
          </button>
        </div>
        <ul className="grid grid-cols-3 gap-2 px-4 pt-2 pb-3">
          {[...rest.map((item) => ({ ...item, icon: navIcon[item.key] })), ...extras].map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-fill px-2 text-center text-sm font-medium text-fg aria-[current=page]:text-accent-text"
              >
                <item.icon className="size-6" strokeWidth={1.8} aria-hidden />
                {item.key === "dates" ? "Fechas" : item.label}
                {item.key === "inbox" && inboxCount > 0 ? <span className="sr-only">{inboxCount} sin procesar</span> : null}
              </Link>
            </li>
          ))}
        </ul>
        <form action={signOut} className="flex gap-2 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Link
            href={panelRoutes.settings}
            onClick={() => setOpen(false)}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-medium text-fg-muted hover:bg-fill"
          >
            <Settings className="size-4" strokeWidth={2} aria-hidden />
            Ajustes
          </Link>
          <button
            type="submit"
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-medium text-fg-muted hover:bg-fill"
          >
            <LogOut className="size-4" strokeWidth={2} aria-hidden />
            Cerrar sesión
          </button>
        </form>
      </dialog>
    </>
  );
}
