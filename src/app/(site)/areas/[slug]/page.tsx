import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/layout/PageHero";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { SmallChange } from "@/components/sections/SmallChange";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { primaryCta } from "@/config/brand";
import { routes } from "@/config/site";
import { areaBySlug, areas, signals } from "@/content/areas";
import { methodName } from "@/content/method";
import { breadcrumbSchema, faqSchema, pageMetadata, serviceSchema } from "@/lib/seo";

export function generateStaticParams() {
  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = areaBySlug(slug);
  if (!area) return {};

  return pageMetadata({
    title: area.seo.title,
    description: area.seo.description,
    path: routes.area(area.slug),
  });
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = areaBySlug(slug);
  if (!area) notFound();

  const crumbs = [
    { name: "Inicio", path: routes.home },
    { name: "Qué mejoramos", path: routes.areas },
    { name: area.shortTitle, path: routes.area(area.slug) },
  ];

  const related = signals.filter((signal) => signal.area === area.slug);
  const others = areas.filter((item) => item.slug !== area.slug);

  return (
    <>
      <PageHero
        eyebrow={`Área ${area.number}`}
        title={area.title}
        lead={area.promise}
        crumbs={crumbs}
        aside={
          <div className="flex flex-col gap-4 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p className="type-label text-fg-subtle">Qué se mide aquí</p>
            <ul className="flex flex-col gap-2">
              {area.signals.map((signal) => (
                <li key={signal} className="text-sm text-fg-muted">
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        }
      >
        <Button href={primaryCta.href} event="cta_primary_click" eventLocation="area_hero">
          {primaryCta.shortLabel}
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </Button>
      </PageHero>

      <Section tone="paper">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="01"
            eyebrow="Lo que suele pasar"
            title="Los problemas que nos encontramos casi siempre"
            lead={area.intro}
          />

          <div className="grid grid-cols-1 gap-x-16 gap-y-10 border-t border-line pt-10 md:grid-cols-2">
            {area.problems.map((problem, index) => (
              <Reveal key={problem.title} delay={Math.min(index, 3)} className="flex flex-col gap-3">
                <h3 className="max-w-[26ch] text-h4 font-medium text-fg">{problem.title}</h3>
                <p className="max-w-[52ch] text-fg-muted">{problem.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="02"
            eyebrow="Qué hacemos"
            title="Las palancas, en orden de lo que menos cuesta"
            lead="Casi ninguna empieza por construir software. Cuando hace falta, se dice y se calcula."
          />

          <ol className="flex flex-col border-t border-line">
            {area.levers.map((lever, index) => (
              <li key={lever.title} className="border-b border-line">
                <Reveal
                  delay={Math.min(index, 4)}
                  className="grid grid-cols-1 gap-3 py-6 lg:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.2fr)] lg:items-baseline lg:gap-10"
                >
                  <span className="tnum type-label text-fg-subtle">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-h4 font-medium text-fg">{lever.title}</h3>
                  <p className="text-fg-muted">{lever.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {related.length ? (
        <Section tone="paper" divided>
          <Container className="flex flex-col gap-12">
            <SectionHeader
              index="03"
              eyebrow="Señales"
              title="Cómo se nota desde dentro"
            />
            <ul className="grid grid-cols-1 gap-x-10 border-t border-line pt-10 md:grid-cols-2">
              {related.map((signal) => (
                <li key={signal.id} className="flex flex-col gap-2 border-b border-line py-5">
                  <p className="text-[0.9375rem] font-medium text-fg">{signal.situation}</p>
                  <p className="text-sm text-fg-muted">{signal.fix}</p>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <SmallChange location={`area_${area.slug}`} />

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <SectionHeader
            eyebrow="Cómo trabajamos"
            title={`Todo esto se aplica con el ${methodName}`}
            lead="Descubrir, detectar, priorizar, transformar y medir. Sin saltos de fe."
            size="side"
            action={
              <Link
                href={routes.method}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
              >
                Ver el método
                <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
              </Link>
            }
          />

          <ul className="flex flex-col border-t border-line">
            {others.map((item) => (
              <li key={item.slug} className="border-b border-line">
                <Link
                  href={routes.area(item.slug)}
                  className="group/card flex flex-col gap-1.5 py-5 transition-opacity hover:opacity-80"
                >
                  <span className="type-label flex items-center gap-3 text-fg-subtle">
                    <span className="tnum">{item.number}</span>
                    Otra área
                  </span>
                  <span className="text-h4 font-medium text-fg">{item.title}</span>
                  <span className="text-sm text-fg-muted">{item.promise}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <FaqSection items={area.faq} />

      <FinalCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceSchema({
              name: area.title,
              description: area.seo.description,
              path: routes.area(area.slug),
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(area.faq)) }}
      />
    </>
  );
}
