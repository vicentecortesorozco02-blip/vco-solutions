import { TimeCalculator } from "@/components/features/TimeCalculator";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * The arithmetic section.
 *
 * This is where a metrics band would normally go. We have no client figures
 * yet, so instead of inventing them the visitor runs the numbers on their own
 * process. It is more persuasive than a fabricated statistic and it is true.
 */
export function TimeMath() {
  return (
    <Section id="calculo" tone="paper" divided>
      <Container className="flex flex-col gap-12">
        <SectionHeader
          index="02"
          eyebrow="La cuenta que nadie hace"
          title="Doce minutos, veinticinco veces por semana, son más de doscientas horas al año"
          lead="Las tareas repetitivas no se notan porque cada una es corta. Se notan cuando se suman."
        />

        <Reveal>
          <TimeCalculator />
        </Reveal>
      </Container>
    </Section>
  );
}
