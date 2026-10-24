import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { Sectors } from "@/components/sections/Sectors";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { routes } from "@/config/site";
import { areas } from "@/content/areas";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Qué mejoramos en una empresa",
  description:
    "Crecimiento comercial, experiencia del cliente y eficiencia. Las tres áreas donde se concentran las oportunidades que la mayoría de empresas está dejando escapar.",
  path: routes.areas,
});

const crumbs = [
  { name: "Inicio", path: routes.home },
  { name: "Qué mejoramos", path: routes.areas },
];

export default function AreasPage() {
  return (
    <>
      <PageHero
        eyebrow="Qué mejoramos"
        title="Vender mejor, atender mejor, trabajar con menos fricción"
        lead="No necesitas más herramientas: necesitas aprovechar mejor las que ya tienes. Estas son las tres áreas donde miramos primero."
        crumbs={crumbs}
      />

      {areas.map((area, index) => (
        <Section
          key={area.slug}
          tone={index % 2 === 0 ? "paper" : "surface"}
          divided={index > 0}
        >
          <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
            <div className="flex flex-col gap-5">
              <p className="type-label flex items-center gap-3 text-fg-subtle">
                <span className="tnum">{area.number}</span>
                {area.shortTitle}
              </p>
              <h2 className="type-display text-h2 text-fg">{area.promise}</h2>
              <p className="text-fg-muted">{area.intro}</p>
              <Link
                href={routes.area(area.slug)}
                className="group/link inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
              >
                Ver {area.shortTitle.toLowerCase()} en detalle
                <ArrowRight
                  className="size-4 transition-transform duration-[var(--duration-base)] group-hover/link:translate-x-0.5"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </Link>
            </div>

            <Reveal>
              <ul className="flex flex-col border-t border-line">
                {area.levers.map((lever) => (
                  <li key={lever.title} className="flex flex-col gap-1.5 border-b border-line py-5">
                    <h3 className="text-[0.9375rem] font-medium text-fg">{lever.title}</h3>
                    <p className="text-sm text-fg-muted">{lever.body}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </Container>
        </Section>
      ))}

      <Sectors />

      <FinalCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />
    </>
  );
}
