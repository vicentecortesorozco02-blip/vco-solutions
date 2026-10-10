import { Container } from "@/components/ui/Container";
import { Faq } from "@/components/ui/Faq";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { FaqItem } from "@/content/types";

/**
 * Questions before the closing ask. Header across the top, answers under it at
 * reading width: the wide uppercase headline does not fit in a side column.
 */
export function FaqSection({
  items,
  title = ["Lo que se pregunta", "antes de dar el paso."],
  lead = "Las dudas reales, contestadas sin rodeos. Si falta la tuya, escríbenos y la añadimos.",
  eyebrow = "Preguntas frecuentes",
}: {
  items: FaqItem[];
  title?: string | readonly string[];
  lead?: string;
  eyebrow?: string;
}) {
  return (
    <Section id="faq" tone="surface" divided>
      <Container className="flex flex-col gap-12 lg:gap-16">
        <SectionHeader eyebrow={eyebrow} title={title} lead={lead} />
        <div className="max-w-[var(--container-content)]">
          <Faq items={items} />
        </div>
      </Container>
    </Section>
  );
}
