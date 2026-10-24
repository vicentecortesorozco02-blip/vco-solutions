import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { sectors } from "@/content/sectors";

/**
 * Sectores, en una línea.
 *
 * No son servicios distintos: es el mismo trabajo contado con el vocabulario
 * de cada negocio, que es como lo reconoce quien tiene el problema.
 */
export function Sectors() {
  return (
    <Section id="sectores" tone="sunken" divided>
      <Container className="flex flex-col gap-10 lg:gap-14">
        <SectionHeader
          eyebrow="Por sector"
          title={["Lo que se repite", "en tu tipo de negocio"]}
          lead="Un hotel pierde reservas directas, una clínica pierde huecos de agenda y una asesoría pierde horas tecleando facturas. Cambia el nombre del problema, no la forma de resolverlo."
        />

        <ul className="flex flex-wrap gap-3">
          {sectors.map((sector) => (
            <li key={sector.slug}>
              <Link
                href={routes.sector(sector.slug)}
                className="group/sector inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-medium text-fg ring-1 ring-line transition-colors duration-[var(--duration-base)] hover:ring-line-strong"
              >
                {sector.name}
                <ArrowRight
                  className="size-3.5 text-fg-subtle transition-transform duration-[var(--duration-base)] group-hover/sector:translate-x-0.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
