"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brand, primaryCta } from "@/config/brand";
import { primaryNav, routes } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Site header.
 *
 * Transparent over the hero, then it commits: a hairline and a solid surface
 * once the page has scrolled. The mobile menu is a designed full-screen view,
 * not the desktop nav in a drawer: numbered entries, a line of context each,
 * the CTA pinned at the bottom where a thumb is.
 *
 * The panel closes from its own links rather than from a pathname effect:
 * setState inside an effect causes a cascading render, and the click is the
 * real event anyway.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the mobile menu, and allow Escape to dismiss it.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-colors duration-[var(--duration-base)]",
          scrolled || open
            ? "border-b border-line bg-bg/88 backdrop-blur-md supports-[backdrop-filter]:bg-bg/72"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
          <Logo />

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center rounded-sm px-3 text-[0.9375rem] transition-colors duration-[var(--duration-fast)]",
                      isActive(item.href)
                        ? "text-fg"
                        : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden lg:block">
            <Button
              href={primaryCta.href}
              size="md"
              event="cta_primary_click"
              eventLocation="header"
            >
              {primaryCta.shortLabel}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-movil"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-sm text-fg lg:hidden"
          >
            <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
            {open ? (
              <X className="size-5" strokeWidth={1.75} />
            ) : (
              <Menu className="size-5" strokeWidth={1.75} />
            )}
          </button>
        </Container>
      </header>

      {/*
       * The mobile panel is a sibling of the header on purpose. The header uses
       * backdrop-blur, and a backdrop-filter establishes a containing block for
       * fixed descendants: nested here, the panel would be laid out inside the
       * 64px header box and collapse to nothing.
       */}
      <div
        id="menu-movil"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto border-t border-line bg-bg lg:hidden"
      >
        <nav aria-label="Principal (móvil)" className="flex-1">
          <ul className="flex flex-col">
            {primaryNav.map((item, index) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 px-[var(--gutter)] py-5 active:bg-bg-sunken"
                >
                  <span className="tnum text-2xs font-medium text-accent-text">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-h3 text-fg">{item.label}</span>
                    {item.description ? (
                      <span className="text-sm text-fg-muted">{item.description}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sticky bottom-0 flex flex-col gap-4 border-t border-line bg-bg px-[var(--gutter)] pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
          <Button
            href={primaryCta.href}
            size="lg"
            block
            onClick={() => setOpen(false)}
            event="cta_primary_click"
            eventLocation="mobile_menu"
          >
            {primaryCta.label}
            <ArrowRight className="size-4" strokeWidth={2} />
          </Button>

          <div className="flex items-center justify-between text-sm">
            <a
              href={`mailto:${brand.email}`}
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center text-fg-muted hover:text-fg"
            >
              {brand.email}
            </a>
            <Link
              href={routes.diagnosis}
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center text-fg-muted hover:text-fg"
            >
              Calcular horas
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
