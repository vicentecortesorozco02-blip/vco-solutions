import { ImpactCalculator } from "@/components/features/ImpactCalculator";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * «Una pequeña mejora puede cambiar mucho».
 *
 * El argumento central de la casa, y la única forma honesta de enseñarlo
 * mientras no haya resultados de clientes publicables: que el visitante haga
 * la cuenta con sus propios números y vea la cuenta entera.
 */
export function SmallChange({ location = "home" }: { location?: string }) {
  return (
    <Section id="mejora">
      <Container className="flex flex-col gap-12 lg:gap-16">
        <SectionHeader
          eyebrow="Pequeños cambios, grandes resultados"
          title={["Una pequeña mejora", "puede cambiar mucho"]}
          lead="Pon tus números y mira la cuenta entera: seis escenarios, cada uno con lo que es facturación, lo que es ahorro y lo que queda como beneficio."
        />

        <ImpactCalculator location={location} />

        <p className="max-w-[60ch] text-sm text-fg-muted">
          Mezclar facturación con beneficio es la forma más rápida de tomar una mala decisión: aquí
          nunca van juntos.
        </p>
      </Container>
    </Section>
  );
}
