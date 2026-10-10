import { FrontPicker } from "@/components/features/FrontPicker";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { solutionSummaries } from "@/content/solutions";

/**
 * What we take off the table, as one big list of words.
 *
 * Categories are outcome-led, never technology-led. The list is generated from
 * content, so a seventh front is a data change and not a layout change. Icons
 * stay behind: a client component cannot receive them, and the list does not
 * need them.
 */
export function Solutions() {
  const items = solutionSummaries.map(({ slug, shortTitle, title, excerpt, chain }) => ({
    slug,
    href: routes.solution(slug),
    shortTitle,
    title,
    excerpt,
    chain,
  }));

  return (
    <Section id="soluciones" tone="paper">
      <Container className="flex flex-col gap-14 lg:gap-20">
        <SectionHeader
          eyebrow="Qué eliminamos"
          title={["Seis frentes", "donde se esconden las horas."]}
          lead="Cada uno empieza igual: un proceso concreto, medido, con su antes y su después."
          action={
            <Button
              href={routes.solutions}
              variant="secondary"
              event="cta_secondary_click"
              eventLocation="solutions"
            >
              Ver todas las soluciones
            </Button>
          }
        />

        <FrontPicker items={items} />
      </Container>
    </Section>
  );
}
