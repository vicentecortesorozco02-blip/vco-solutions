import { Container } from "@/components/ui/Container";
import { Faq } from "@/components/ui/Faq";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { FaqItem } from "@/content/types";

export function FaqSection({
  items,
  index = "07",
  title = "Lo que suele preguntarse antes de dar el paso",
  lead = "Las dudas reales, contestadas sin rodeos. Si falta la tuya, escríbenos y la añadimos.",
  eyebrow = "Preguntas frecuentes",
}: {
  items: FaqItem[];
  index?: string;
  title?: string;
  lead?: string;
  eyebrow?: string;
}) {
  return (
    <Section id="faq" tone="surface" divided>
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-20">
        <SectionHeader index={index} eyebrow={eyebrow} title={title} lead={lead} />
        <Faq items={items} />
      </Container>
    </Section>
  );
}
