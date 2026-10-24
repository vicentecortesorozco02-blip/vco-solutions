import type { Metadata } from "next";

import { ContactForm } from "@/components/features/ContactForm";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { brand } from "@/config/brand";
import { routes } from "@/config/site";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contacto",
  description:
    "Cuéntanos en dos líneas qué te gustaría mejorar en tu empresa. Te contestamos en un día laborable con una opinión honesta, sin llamadas comerciales.",
  path: routes.contact,
});

const crumbs = [
  { name: "Inicio", path: routes.home },
  { name: "Contacto", path: routes.contact },
];

const whatHappensNext = [
  {
    number: "01",
    title: "Lo leemos nosotros",
    body: "No hay departamento comercial. Lo lee quien va a trabajar en ello.",
  },
  {
    number: "02",
    title: "Te contestamos con una opinión",
    body: "Si es un caso claro, te lo decimos. Si no lo es, también, y te explicamos por qué.",
  },
  {
    number: "03",
    title: "Si tiene sentido, hablamos 30 minutos",
    body: "Sin presentación de empresa. Preguntas sobre cómo trabajáis y poco más.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Section tone="paper" rhythm="tight" className="border-b border-line">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <p className="type-label text-fg-subtle">
                Contacto
              </p>
              <h1 className="max-w-[18ch] type-display text-h1 text-fg">
                Cuéntanos qué quieres mejorar
              </h1>
              <p className="max-w-[52ch] text-lead text-fg-muted">
                No hace falta que sepas cómo se resuelve, ni que lo tengas pensado. Con que nos
                cuentes qué te gustaría mejorar —vender más, atender mejor, ahorrar tiempo— hay
                suficiente para empezar. Si prefieres el formulario completo, está en el{" "}
                <a
                  href={routes.diagnosis}
                  className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent"
                >
                  diagnóstico de potencial
                </a>
                .
              </p>
            </div>

            <ol className="flex flex-col border-t border-line">
              {whatHappensNext.map((step) => (
                <li
                  key={step.number}
                  className="flex items-baseline gap-5 border-b border-line py-5"
                >
                  <span className="tnum text-2xs font-medium text-accent-text">
                    {step.number}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[0.9375rem] font-medium text-fg">
                      {step.title}
                    </span>
                    <span className="max-w-[44ch] text-sm text-fg-muted">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <p className="text-sm text-fg-muted">
              ¿Prefieres el correo de siempre?{" "}
              <a
                href={`mailto:${brand.email}`}
                className="text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
              >
                {brand.email}
              </a>
            </p>
          </div>

          <div className="lg:pt-14">
            <ContactForm />
          </div>
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(crumbs)),
        }}
      />
    </>
  );
}
