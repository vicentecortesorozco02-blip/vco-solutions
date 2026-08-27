import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { principles } from "@/content/method";

/**
 * Why work with us.
 *
 * Four commitments, each one a decision a client can hold us to. No adjectives
 * about excellence, no team photos, no icons: this section is prose and it
 * earns its place by being checkable.
 */
export function Principles() {
  return (
    <Section id="principios" tone="paper" divided>
      <Container className="flex flex-col gap-12">
        <SectionHeader
          index="06"
          eyebrow="Por qué nosotros"
          title="Cuatro compromisos que puedes exigirnos"
          lead="Sirven para decidir si encajamos y, sobre todo, para reclamarnos si algún día dejamos de cumplirlos."
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
  );
}
