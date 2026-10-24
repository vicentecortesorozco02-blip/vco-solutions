import type { Metadata } from "next";

import { DiagnosisForm } from "@/components/features/DiagnosisForm";
import { ImpactCalculator } from "@/components/features/ImpactCalculator";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { methodName } from "@/content/method";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Diagnóstico de potencial: una conversación de 20 minutos",
  description:
    "Cuéntanos cómo funciona tu empresa y qué quieres mejorar. Empezamos con una conversación de veinte minutos para ver si hay oportunidades que merezca la pena perseguir.",
  path: routes.diagnosis,
});

const crumbs = [
  { name: "Inicio", path: routes.home },
  { name: "Diagnóstico", path: routes.diagnosis },
];

/** Qué pasa después de enviar. Sin promesas que no se puedan cumplir. */
const steps = [
  {
    title: "Nos escribes",
    body: "Seis datos. Nada de cuestionarios largos ni de llamadas comerciales por sorpresa.",
  },
  {
    title: "Te contestamos en un día laborable",
    body: "Con una primera opinión sobre lo que nos cuentas y una propuesta de día y hora.",
  },
  {
    title: "Veinte minutos, sin coste",
    body: "Hablamos de cómo entra un cliente, cómo se vende y dónde se os va el tiempo. Tú decides si seguimos.",
  },
  {
    title: "Si hay recorrido, lo decimos. Y si no, también",
    body: "Cuando no vemos oportunidades que justifiquen el trabajo, lo decimos en esa misma conversación.",
  },
];

const honesty = [
  "La conversación de veinte minutos no tiene coste y no obliga a nada.",
  "Un diagnóstico completo es un trabajo con alcance y precio: se presupuesta antes de empezar, nunca se regala a medias.",
  "No prometemos porcentajes de mejora antes de haber medido tu caso.",
  "Tus datos se usan solo para contestarte. No se venden ni se ceden.",
];

export default function DiagnosisPage() {
  return (
    <>
      <PageHero
        eyebrow="Diagnóstico de potencial"
        title="Descubre el potencial de tu empresa"
        lead="Antes de invertir más, descubre qué puedes mejorar. Empezamos con una conversación de veinte minutos sobre cómo funciona tu negocio."
        crumbs={crumbs}
        aside={
          <div className="flex flex-col gap-4 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p className="type-label text-fg-subtle">Qué miramos</p>
            <p className="text-sm text-fg-muted">
              Cómo entra un cliente, cómo se vende, cómo se entrega, en qué se va el tiempo y dónde
              está el margen. Es la fase 01 del {methodName}.
            </p>
          </div>
        }
      />

      <Section tone="paper">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="flex flex-col gap-10">
            <SectionHeader
              eyebrow="Qué pasa después"
              title="Cuatro pasos y ninguna sorpresa"
              size="side"
            />

            <ol className="flex flex-col border-t border-line">
              {steps.map((step, index) => (
                <li key={step.title} className="border-b border-line">
                  <Reveal delay={Math.min(index, 3)} className="flex gap-4 py-5">
                    <span className="tnum pt-1 text-xs text-fg-subtle">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-[0.9375rem] font-medium text-fg">{step.title}</span>
                      <span className="text-sm text-fg-muted">{step.body}</span>
                    </span>
                  </Reveal>
                </li>
              ))}
            </ol>

            <div className="flex flex-col gap-3">
              <p className="type-label text-fg-subtle">Lo que sí y lo que no</p>
              <ul className="flex flex-col gap-2">
                {honesty.map((line) => (
                  <li key={line} className="flex gap-2 text-sm text-fg-muted">
                    <span aria-hidden className="text-fg-subtle">
                      ·
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="type-display text-h3 text-fg">Cuéntanos tu caso</h2>
            <DiagnosisForm />
          </div>
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Mientras tanto"
            title={["Haz la cuenta", "con tus propios números"]}
            lead="Seis escenarios sobre los datos de tu empresa. Es aritmética, no una promesa: por eso se enseña el cálculo entero."
          />
          <ImpactCalculator location="diagnostico" />
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />
    </>
  );
}
