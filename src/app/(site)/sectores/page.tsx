import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { routes } from "@/config/site";
import { sectors } from "@/content/sectors";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sectores: cómo se llama el problema en tu negocio",
  description:
    "Hoteles, restaurantes, clínicas, transporte, comercios, despachos y pymes con administración. Lo que se repite en cada sector y qué oportunidades hay detrás.",
  path: routes.sectors,
});

const crumbs = [
  { name: "Inicio", path: routes.home },
  { name: "Sectores", path: routes.sectors },
];

export default function SectorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Sectores"
        title="Lo que se repite en tu tipo de negocio"
        lead="El mecanismo es el mismo en todas partes: oportunidades que entran y se enfrían, trabajo repetido y margen que nadie mide. Lo que cambia es cómo se llama."
        crumbs={crumbs}
      />

      <Section tone="paper">
        <Container>
          <ul className="grid grid-cols-1 gap-x-10 border-t border-line md:grid-cols-2">
            {sectors.map((sector, index) => (
              <li key={sector.slug} className="border-b border-line">
                <Reveal delay={Math.min(index, 4)}>
                  <Link
                    href={routes.sector(sector.slug)}
                    className="group/card flex h-full flex-col gap-3 py-7 transition-opacity duration-[var(--duration-base)] hover:opacity-80"
                  >
                    <span className="type-display text-h3 text-fg">{sector.name}</span>
                    <span className="max-w-[56ch] text-sm text-fg-muted">{sector.intro}</span>
                    <span className="inline-flex items-center gap-2 pt-1 text-sm font-medium text-fg">
                      Ver oportunidades
                      <ArrowRight
                        className="size-4 transition-transform duration-[var(--duration-base)] group-hover/card:translate-x-0.5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>

          <p className="pt-8 text-sm text-fg-muted">
            ¿Tu sector no está? El método es el mismo: se mira cómo entra un cliente, cómo se vende,
            cómo se entrega y en qué se va el tiempo.
          </p>
        </Container>
      </Section>

      <FinalCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />
    </>
  );
}
