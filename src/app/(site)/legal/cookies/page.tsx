import type { Metadata } from "next";

import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { brand } from "@/config/brand";
import { routes } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Política de cookies",
  description: "Qué cookies utiliza este sitio web.",
  path: routes.legal.cookies,
  index: false,
});

/**
 * Accurate as of today: the site sets no cookies at all.
 *
 * If analytics are ever added, this page and a consent banner must be updated
 * in the same change. See docs/DECISIONS.md.
 */
export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Política de cookies"
        crumbs={[
          { name: "Inicio", path: routes.home },
          { name: "Cookies", path: routes.legal.cookies },
        ]}
      />

      <Section tone="paper" rhythm="tight">
        <Container>
          <Prose>
            <h2>Este sitio no utiliza cookies</h2>
            <p>
              A día de hoy este sitio web no instala cookies propias ni de
              terceros, no utiliza sistemas de analítica ni de publicidad, y no
              realiza seguimiento entre sitios. Por eso no verás ningún aviso de
              cookies: no hay nada que consentir.
            </p>

            <h2>Si esto cambia</h2>
            <p>
              Si en el futuro incorporamos medición de audiencia, actualizaremos
              esta página con el detalle de cada cookie, su finalidad y su
              duración, y solicitaremos tu consentimiento antes de instalar
              ninguna que no sea estrictamente necesaria.
            </p>

            <h2>Almacenamiento técnico</h2>
            <p>
              El formulario de contacto no guarda información en tu navegador. La
              única comunicación con nuestros servidores es el envío del propio
              mensaje, descrito en la{" "}
              <a href={routes.legal.privacy}>política de privacidad</a>.
            </p>

            <h2>Contacto</h2>
            <p>
              Para cualquier duda sobre este punto, escríbenos a{" "}
              <a href={`mailto:${brand.email}`}>{brand.email}</a>.
            </p>
          </Prose>
        </Container>
      </Section>
    </>
  );
}
