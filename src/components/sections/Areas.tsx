import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { areas } from "@/content/areas";

/**
 * Las tres áreas.
 *
 * Responde «¿en qué me puedes ayudar?» sin nombrar una sola tecnología. Cada
 * tarjeta lleva su número editorial, la promesa en una frase y las palancas
 * concretas, para que se entienda que detrás hay trabajo, no un eslogan.
 */
export function Areas() {
  return (
    <Section id="areas">
      <Container className="flex flex-col gap-14 lg:gap-20">
        <SectionHeader
          eyebrow="Tres grandes áreas"
          title={["Vender mejor, atender mejor,", "trabajar con menos fricción"]}
          lead="Casi todas las oportunidades que encontramos caen en una de estas tres. La tecnología aparece dentro, cuando es el camino más corto."
          action={
            <Link
              href={routes.areas}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
            >
              Ver las tres en detalle
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </Link>
          }
        />

        <Reveal>
          <ul className="grid grid-cols-1 gap-x-10 lg:grid-cols-3">
            {areas.map((area) => (
              <li key={area.slug} className="border-t border-line-strong">
                <Link
                  href={routes.area(area.slug)}
                  className="group/card flex h-full flex-col gap-5 py-7 transition-opacity duration-[var(--duration-base)] hover:opacity-80"
                >
                  <span className="type-label flex items-center gap-3 text-fg-subtle">
                    <span className="tnum">{area.number}</span>
                    {area.shortTitle}
                  </span>

                  <span className="text-h3 text-fg">{area.promise}</span>

                  <ul className="flex flex-col gap-2">
                    {area.levers.slice(0, 3).map((lever) => (
                      <li key={lever.title} className="flex gap-2 text-sm text-fg">
                        <span aria-hidden className="text-fg-subtle">
                          ·
                        </span>
                        {lever.title}
                      </li>
                    ))}
                  </ul>

                  <span className="mt-auto flex flex-col gap-1.5 border-t border-line pt-4">
                    <span className="type-label text-fg-subtle">Qué se mide</span>
                    <span className="text-sm text-fg-muted">{area.signals[0]}</span>
                  </span>

                  <span className="inline-flex items-center gap-2 pt-2 text-sm font-medium text-fg">
                    Qué mejoramos aquí
                    <ArrowRight
                      className="size-4 transition-transform duration-[var(--duration-base)] group-hover/card:translate-x-0.5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
