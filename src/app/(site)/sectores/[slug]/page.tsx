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
import { CompareBars, FigureNote, StatRow } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { primaryCta } from "@/config/brand";
import { routes } from "@/config/site";
import { areas } from "@/content/areas";
import { sectorBySlug, sectors } from "@/content/sectors";
import { breadcrumbSchema, faqSchema, pageMetadata, serviceSchema } from "@/lib/seo";

export function generateStaticParams() {
  return sectors.map((sector) => ({ slug: sector.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sector = sectorBySlug(slug);
  if (!sector) return {};

  return pageMetadata({
    title: sector.seo.title,
    description: sector.seo.description,
    path: routes.sector(sector.slug),
  });
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sector = sectorBySlug(slug);
  if (!sector) notFound();

  const crumbs = [
    { name: "Inicio", path: routes.home },
    { name: "Sectores", path: routes.sectors },
    { name: sector.shortName, path: routes.sector(sector.slug) },
  ];

  const others = sectors.filter((item) => item.slug !== sector.slug);

  return (
    <>
      <PageHero
        eyebrow="Sector"
        title={sector.name}
        lead={sector.intro}
        crumbs={crumbs}
        aside={
          <div className="flex flex-col gap-4 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p className="type-label text-fg-subtle">Lo que se repite</p>
            <ul className="flex flex-col gap-2">
              {sector.problems.slice(0, 3).map((problem) => (
                <li key={problem} className="text-sm text-fg-muted">
                  {problem}
                </li>
              ))}
            </ul>
          </div>
        }
      >
        <Button href={primaryCta.href} event="cta_primary_click" eventLocation="sector_hero">
          {primaryCta.shortLabel}
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </Button>
      </PageHero>

      <Section tone="paper">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="01"
            eyebrow="Problemas habituales"
            title="Esto es lo que nos cuentan"
            lead="Si reconoces tres de esta lista, hay trabajo que hacer antes de invertir en nada nuevo."
          />

          <ol className="grid grid-cols-1 gap-x-10 border-t border-line pt-8 md:grid-cols-2">
            {sector.problems.map((problem, index) => (
              <li key={problem} className="flex gap-3 border-b border-line py-5">
                <span className="tnum pt-0.5 text-xs text-fg-subtle">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.9375rem] text-fg">{problem}</span>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="02"
            eyebrow="Oportunidades"
            title="Dónde suele estar el dinero"
          />

          <div className="grid grid-cols-1 gap-x-16 gap-y-10 border-t border-line pt-10 md:grid-cols-2">
            {sector.opportunities.map((opportunity, index) => (
              <Reveal key={opportunity.title} delay={Math.min(index, 3)} className="flex flex-col gap-3">
                <h3 className="max-w-[26ch] text-h4 font-medium text-fg">{opportunity.title}</h3>
                <p className="max-w-[52ch] text-fg-muted">{opportunity.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="paper" divided>
        <Container className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <SectionHeader
            index="03"
            eyebrow="Un ejemplo con números"
            title={sector.example.title}
            lead="Simulación con valores de ejemplo, no el resultado de ningún cliente. Con tus números el resultado cambia."
            size="side"
          />

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-8 rounded-2xl bg-surface p-6 ring-1 ring-line sm:p-8">
              <CompareBars
                caption={sector.example.compare.label}
                unit={sector.example.compare.unit}
                bars={[
                  {
                    label: sector.example.compare.now.label,
                    value: sector.example.compare.now.value,
                  },
                  {
                    label: sector.example.compare.better.label,
                    value: sector.example.compare.better.value,
                    tone: "accent",
                  },
                ]}
              />

              <StatRow stats={sector.example.stats} />

              <FigureNote>{sector.example.workings}</FigureNote>
            </div>

            <div className="flex flex-col gap-2">
              <p className="type-label text-fg-subtle">Hipótesis usadas</p>
              <ul className="flex flex-col gap-2">
                {sector.example.assumptions.map((assumption) => (
                  <li key={assumption} className="flex gap-2 text-sm text-fg-muted">
                    <span aria-hidden className="text-fg-subtle">
                      ·
                    </span>
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <SmallChange location={`sector_${sector.slug}`} />

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <SectionHeader
            eyebrow="Y además"
            title="Las tres áreas, aplicadas a tu negocio"
            size="side"
          />

          <ul className="flex flex-col border-t border-line">
            {areas.map((area) => (
              <li key={area.slug} className="border-b border-line">
                <Link
                  href={routes.area(area.slug)}
                  className="flex flex-col gap-1.5 py-5 transition-opacity hover:opacity-80"
                >
                  <span className="type-label flex items-center gap-3 text-fg-subtle">
                    <span className="tnum">{area.number}</span>
                    {area.shortTitle}
                  </span>
                  <span className="text-sm text-fg-muted">{area.promise}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <FaqSection items={sector.faq} />

      <Section tone="paper" divided rhythm="tight">
        <Container className="flex flex-col gap-5">
          <p className="type-label text-fg-subtle">Otros sectores</p>
          <ul className="flex flex-wrap gap-3">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={routes.sector(item.slug)}
                  className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm font-medium text-fg ring-1 ring-line transition-colors hover:ring-line-strong"
                >
                  {item.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

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
              name: `Mejora de procesos y ventas para ${sector.shortName.toLowerCase()}`,
              description: sector.seo.description,
              path: routes.sector(sector.slug),
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(sector.faq)) }}
      />
    </>
  );
}
