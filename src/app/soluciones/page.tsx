import type { Metadata } from "next";

import { SolutionCard } from "@/components/cards/SolutionCard";
import { FinalCta } from "@/components/sections/FinalCta";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { routes } from "@/config/site";
import { solutionSummaries } from "@/content/solutions";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Soluciones",
  description:
    "Presupuestos automáticos, administración, correo, procesos comerciales, herramientas internas e IA aplicada. Seis frentes donde eliminar trabajo manual.",
  path: routes.solutions,
});

const crumbs = [
  { name: "Inicio", path: routes.home },
  { name: "Soluciones", path: routes.solutions },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Soluciones"
        title="Qué tipo de trabajo manual quitamos de en medio"
        lead="Seis categorías, un mismo punto de partida: un proceso concreto, medido, con su antes y su después. La lista crece a medida que aparecen procesos nuevos."
        crumbs={crumbs}
      />

      <Section tone="paper">
        <Container>
          <Reveal>
            <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {solutionSummaries.map((solution) => (
                <SolutionCard key={solution.slug} solution={solution} />
              ))}
            </div>
          </Reveal>

          <p className="mt-8 max-w-[62ch] text-sm text-fg-subtle">
            ¿Tu proceso no encaja en ninguna? Es lo más habitual. Estas
            categorías describen por dónde solemos entrar, no un catálogo
            cerrado de lo que se puede construir.
          </p>
        </Container>
      </Section>

      <FinalCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(crumbs)),
        }}
      />
    </>
  );
}
