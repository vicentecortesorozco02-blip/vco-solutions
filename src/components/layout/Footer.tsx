import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { brand } from "@/config/brand";
import { footerNav } from "@/config/site";

/**
 * Footer.
 *
 * Deliberately quiet. The conversion moment happens in the section above it;
 * the footer's job is navigation, legal reachability and a last plain-language
 * statement of what the company does.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-bg-subtle">
      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)] lg:gap-20">
          <div className="flex max-w-[38ch] flex-col gap-5">
            <Logo />
            <p className="text-sm text-fg-muted">{brand.description}</p>
            <a
              href={`mailto:${brand.email}`}
              className="inline-flex min-h-8 w-fit items-center text-sm text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
            >
              {brand.email}
            </a>
          </div>

          <nav aria-label="Pie de página">
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
              {footerNav.map((group) => (
                <div key={group.title} className="flex flex-col gap-4">
                  <h2 className="text-2xs font-medium uppercase tracking-[0.16em] text-fg-subtle">
                    {group.title}
                  </h2>
                  <ul className="flex flex-col gap-0.5">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="inline-flex min-h-8 items-center text-sm text-fg-muted transition-colors duration-[var(--duration-fast)] hover:text-fg"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-2xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.legalName}. Todos los derechos reservados.
          </p>
          <p>{brand.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
