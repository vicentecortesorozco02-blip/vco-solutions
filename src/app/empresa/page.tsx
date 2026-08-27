import type { Metadata } from "next";

import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { companyStory, engagementStages, fitCriteria } from "@/content/company";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Empresa",
  description:
    "Quiénes somos, cómo entendemos este trabajo y cómo se estructura un proyecto: análisis, implementación, mantenimiento y evolución.",
  path: routes.company,
});

const crumbs = [
  { name: "Inicio", path: routes.home },
  { name: "Empresa", path: routes.company },
];

export default function CompanyPage() {
  return (
    <>
      <PageHero
        eyebrow={companyStory.eyebrow}
        title={companyStory.title}
        lead={companyStory.lead}
        crumbs={crumbs}
      />

      <Section tone="paper">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] lg:gap-20">
          <SectionHeader index="01" eyebrow="Por qué existimos" title="El hueco que vimos" />

          <div className="flex max-w-[64ch] flex-col gap-5 text-lead text-fg-muted">
            {companyStory.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="02"
            eyebrow="Cómo se estructura un proyecto"
            title="Cuatro etapas, cada una con su propia decisión"
            lead="No publicamos tarifas porque cada proceso es distinto y una cifra inventada no ayudaría a nadie. Lo que sí podemos decir es cómo se organiza el trabajo y cuándo se decide cada cosa."
          />

          <ol className="border-t border-line">
            {engagementStages.map((stage, index) => (
              <li key={stage.number} className="border-b border-line">
                <Reveal
                  delay={Math.min(index, 3)}
                  className="grid grid-cols-1 gap-3 py-7 lg:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10 lg:py-8"
                >
                  <p className="tnum text-2xs font-medium tracking-[0.16em] text-accent-text">
                    {stage.number}
                  </p>
                  <h3 className="text-h4 font-medium text-fg">{stage.title}</h3>
                  <div className="flex flex-col gap-2">
                    <p className="max-w-[56ch] text-fg-muted">{stage.body}</p>
                    <p className="text-sm text-fg-subtle">{stage.note}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="paper" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="03"
            eyebrow="Encaje"
            title="Con quién trabajamos bien, y con quién no"
            lead="Decirlo por adelantado ahorra tiempo a todo el mundo, empezando por ti."
          />

          <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
            {[fitCriteria.good, fitCriteria.bad].map((group, index) => (
              <div key={group.title} className="flex flex-col gap-5 bg-bg p-7 lg:p-9">
                <h3 className="text-h4 font-medium text-fg">{group.title}</h3>
                <ul className="flex flex-col gap-3.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-3.5 text-[0.9375rem] text-fg-muted">
                      <span
                        aria-hidden
                        className={
                          index === 0
                            ? "mt-2 size-1.5 shrink-0 rotate-45 bg-accent"
                            : "mt-2 size-1.5 shrink-0 rounded-full border border-line-strong"
                        }
                      />
                      <span className="max-w-[46ch]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
