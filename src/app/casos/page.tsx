import type { Metadata } from "next";

import { CaseCard } from "@/components/cards/CaseCard";
import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { routes } from "@/config/site";
import { allCasesAreDemonstrations, caseSummaries } from "@/content/cases";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Casos",
  description:
    "Procesos completos explicados de principio a fin: cómo se trabajaba antes, qué se construyó y cómo funciona después, con el cálculo a la vista.",
  path: routes.cases,
});

const crumbs = [
  { name: "Inicio", path: routes.home },
  { name: "Casos", path: routes.cases },
];

export default function CasesPage() {
  return (
    <>
      <PageHero
        eyebrow="Casos"
        title="Procesos completos, de principio a fin"
        lead="Cómo se trabajaba antes, qué se construye y cómo queda después. Con el cálculo delante para que puedas comprobarlo."
        crumbs={crumbs}
      />

      {allCasesAreDemonstrations ? (
        <Section tone="paper" rhythm="tight">
          <Container>
            <div className="max-w-[68ch] border-l-2 border-accent bg-bg-subtle p-6 lg:p-7">
              <p className="text-[0.9375rem] text-fg">
                Todavía no hay proyectos de clientes publicados, así que no
                publicamos ninguno.
              </p>
              <p className="mt-3 text-sm text-fg-muted">
                Lo que hay aquí son demostraciones: procesos reales del día a
                día de una empresa, resueltos paso a paso, con la aritmética
                explicada. Cuando entreguemos proyectos y tengamos permiso para
                contarlos, aparecerán con nombre, cifras medidas y el método con
                el que se midieron. Preferimos una página honesta a una página
                llena.
              </p>
            </div>
          </Container>
        </Section>
      ) : null}

      <Section tone="paper" rhythm={allCasesAreDemonstrations ? "tight" : "default"}>
        <Container>
          <Reveal>
            <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
              {caseSummaries.map((entry) => (
                <CaseCard key={entry.slug} entry={entry} />
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      <FinalCta index="02" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(crumbs)),
        }}
      />
    </>
  );
}
