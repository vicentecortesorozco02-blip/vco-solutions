import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { brand } from "@/config/brand";
import { footerNav, panelRoutes } from "@/config/site";

/**
 * Footer.
 *
 * The dark block that closes every page, as in YourHotelWeb. The conversion
 * moment happens in the section above it; the footer's job is navigation,
 * legal reachability and a last plain-language statement of what we do.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-inverse text-fg-inverse">
      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)] lg:gap-20">
          <div className="flex max-w-[38ch] flex-col gap-5">
            <Logo tone="inverse" />
            <p className="text-sm text-fg-inverse-muted">{brand.description}</p>
            <a
              href={`mailto:${brand.email}`}
              className="inline-flex min-h-8 w-fit items-center text-sm text-fg-inverse underline decoration-fg-inverse-quiet underline-offset-4 transition-colors hover:decoration-fg-inverse"
            >
              {brand.email}
            </a>
          </div>

          <nav aria-label="Pie de página">
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
              {footerNav.map((group) => (
                <div key={group.title} className="flex flex-col gap-4">
                  <h2 className="type-label text-fg-inverse-quiet">
                    {group.title}
                  </h2>
                  <ul className="flex flex-col gap-0.5">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="inline-flex min-h-8 items-center text-sm text-fg-inverse-muted transition-colors duration-[var(--duration-fast)] hover:text-fg-inverse"
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

        <div className="mt-14 flex flex-col gap-3 border-t border-line-inverse pt-6 text-xs text-fg-inverse-quiet sm:flex-row sm:items-center sm:justify-between">
          <p>
            {/* La razón social acaba en «S.L.»: sin recortar el punto final
                se lee «S.L..». */}
            © {year} {brand.legalName.replace(/\.$/, "")}. Todos los derechos
            reservados.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p>{brand.tagline}</p>
            {/* Puerta al panel privado. Sin sesión, la página de acceso no
                enseña nada; robots.txt la deja fuera. */}
            <Link
              href={panelRoutes.signIn}
              rel="nofollow"
              className="inline-flex min-h-8 items-center rounded-full border border-line-inverse px-4 text-xs font-medium text-fg-inverse-muted transition-colors duration-[var(--duration-fast)] hover:border-fg-inverse-quiet hover:text-fg-inverse"
            >
              Área privada
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
