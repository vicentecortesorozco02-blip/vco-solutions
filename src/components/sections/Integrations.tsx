import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { integrations, integrationsNote } from "@/content/integrations";

/**
 * The tools we connect to.
 *
 * Names set as large plain text, the way YourHotelWeb lists booking engines:
 * no borrowed logos, and a disclaimer that says what the list means and what
 * it does not.
 */
export function Integrations() {
  return (
    <Section id="integraciones" tone="inverse">
      <Container className="flex flex-col gap-14 lg:gap-16">
        <SectionHeader
          tone="inverse"
          title={["Conectado a lo", "que ya usas."]}
          lead="No te pedimos que cambies de herramientas. El sistema se integra con las que tu empresa ya tiene y trabaja por debajo."
        />

        <Reveal>
          <ul className="flex flex-wrap gap-x-10 gap-y-8 lg:gap-x-14">
            {integrations.map((tool) => (
              <li key={tool.name} className="flex flex-col gap-1.5">
                <span className="text-list font-medium tracking-[-0.03em] text-fg-inverse">
                  {tool.name}
                </span>
                <span className="text-xs text-fg-inverse-muted">{tool.use}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 border-t border-line-inverse pt-6 text-sm lg:grid-cols-2 lg:gap-16">
          <p className="text-fg-inverse">{integrationsNote.other}</p>
          <p className="text-xs text-fg-inverse-muted">{integrationsNote.disclaimer}</p>
        </div>
      </Container>
    </Section>
  );
}
