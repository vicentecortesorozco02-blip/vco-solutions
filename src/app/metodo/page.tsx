import type { Metadata } from "next";

import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { MethodPhases } from "@/components/sections/MethodPhases";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { methodName, methodPromise, principles } from "@/content/method";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cómo trabajamos",
  description:
    "Cinco fases: mapeamos, cuantificamos, rediseñamos, construimos y comprobamos. Un proceso cada vez, con números antes y después.",
  path: routes.method,
});

const crumbs = [
  { name: "Inicio", path: routes.home },
  { name: "Cómo trabajamos", path: routes.method },
];

const noPromises = [
  {
    title: "No empezamos por la tecnología",
    body: "En la primera reunión no se habla de herramientas. Se habla de cómo entra el trabajo, por cuántas manos pasa y dónde se atasca.",
  },
  {
    title: "No hay proyectos de doce meses",
    body: "Un proceso, funcionando y medido. Después se decide el siguiente con datos encima de la mesa, no con una hoja de ruta escrita hace un año.",
  },
  {
    title: "No prometemos porcentajes antes de medir",
    body: "Cualquiera puede decir un 40%. Nosotros preferimos decirte, en la fase 02, cuántas horas cuesta hoy tu proceso y cuántas creemos que se pueden quitar.",
  },
];

export default function MethodPage() {
  return (
    <>
      <PageHero
        eyebrow="Cómo trabajamos"
        title="Cinco fases. Un proceso cada vez."
        lead={methodPromise}
        crumbs={crumbs}
        aside={
          <div className="flex flex-col gap-4 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p className="text-2xs font-medium uppercase tracking-[0.16em] text-fg-subtle">
              El primer entregable
            </p>
            <p className="font-display text-h3 text-fg">{methodName}</p>
            <p className="text-sm text-fg-muted">
              Un documento con tu proceso dibujado paso a paso, quién hace qué,
              cuánto tiempo consume cada parte y qué se puede quitar. Es tuyo,
              tanto si seguimos trabajando juntos como si no.
            </p>
          </div>
        }
      />

      <Section tone="paper">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="01"
            eyebrow="Las fases"
            title="De la primera reunión a la medición del resultado"
          />
          <MethodPhases tone="default" detailed />
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="02"
            eyebrow="Lo que no hacemos"
            title="Tres cosas que no vas a encontrarte con nosotros"
          />

          <div className="grid grid-cols-1 gap-x-16 gap-y-10 border-t border-line pt-10 md:grid-cols-3">
            {noPromises.map((item, index) => (
              <Reveal key={item.title} delay={Math.min(index, 3)} className="flex flex-col gap-3">
                <h3 className="max-w-[24ch] text-h4 font-medium text-fg">{item.title}</h3>
                <p className="text-fg-muted">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="paper" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="03"
            eyebrow="Compromisos"
            title="Cuatro cosas que puedes exigirnos"
          />

          <div className="grid grid-cols-1 gap-x-16 gap-y-10 border-t border-line pt-10 md:grid-cols-2 lg:gap-x-24">
            {principles.map((principle, index) => (
              <Reveal
                key={principle.title}
                delay={Math.min(index, 3)}
                className="flex flex-col gap-3"
              >
                <h3 className="max-w-[24ch] text-h4 font-medium text-fg">
                  {principle.title}
                </h3>
                <p className="max-w-[52ch] text-fg-muted">{principle.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <FinalCta index="04" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(crumbs)),
        }}
      />
    </>
  );
}
