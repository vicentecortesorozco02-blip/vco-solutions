import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { primaryCta } from "@/config/brand";
import { primaryNav } from "@/config/site";

export default function NotFound() {
  return (
    <Section tone="paper" rhythm="loose">
      <Container className="flex flex-col gap-8">
        <p className="type-label text-fg-subtle">
          Error 404
        </p>

        <h1 className="max-w-[18ch] type-display text-h1 text-fg">
          Esta página no existe.
        </h1>

        <p className="max-w-[48ch] text-lead text-fg-muted">
          O ha cambiado de sitio. Desde aquí puedes seguir por donde ibas.
        </p>

        <nav aria-label="Secciones principales" className="pt-2">
          <ul className="flex flex-col border-t border-line">
            {primaryNav.map((item) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  className="flex flex-col gap-1 py-4 transition-colors hover:text-accent-text"
                >
                  <span className="text-h4 font-medium text-fg">{item.label}</span>
                  {item.description ? (
                    <span className="text-sm text-fg-muted">{item.description}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pt-2">
          <Button href={primaryCta.href} size="lg" event="cta_primary_click" eventLocation="404">
            {primaryCta.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
