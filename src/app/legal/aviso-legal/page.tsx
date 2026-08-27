import type { Metadata } from "next";

import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { brand } from "@/config/brand";
import { routes } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Aviso legal",
  description: "Información legal del titular del sitio web.",
  path: routes.legal.notice,
  index: false,
});

/**
 * NOT LEGAL ADVICE, AND NOT FINAL.
 *
 * This is a structurally complete placeholder in the shape Spanish LSSI-CE
 * requires. Before the site goes to a real domain, the identifying data must
 * be filled from brand config and the whole text reviewed by a lawyer. The
 * bracketed values are deliberately visible so nobody ships them by accident.
 */
export default function LegalNoticePage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Aviso legal"
        crumbs={[
          { name: "Inicio", path: routes.home },
          { name: "Aviso legal", path: routes.legal.notice },
        ]}
      />

      <Section tone="paper" rhythm="tight">
        <Container>
          <Prose>
            <p>
              <strong>Pendiente de revisión legal.</strong> Este texto recoge la
              estructura exigida por la normativa española, pero los datos
              identificativos se completarán cuando la sociedad esté constituida
              y el dominio definitivo esté registrado.
            </p>

            <h2>Titular del sitio web</h2>
            <ul>
              <li>Denominación social: {brand.legalName}</li>
              <li>NIF: {brand.taxId}</li>
              <li>Domicilio: [PENDIENTE]</li>
              <li>
                Correo electrónico: <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </li>
              <li>Datos registrales: [PENDIENTE]</li>
            </ul>

            <h2>Objeto</h2>
            <p>
              Este sitio web tiene como finalidad informar sobre los servicios de
              análisis, automatización y desarrollo de sistemas para procesos
              empresariales que presta el titular, y permitir el contacto con él.
            </p>

            <h2>Condiciones de uso</h2>
            <p>
              El acceso al sitio implica la aceptación de estas condiciones. La
              persona usuaria se compromete a hacer un uso adecuado de los
              contenidos y a no emplearlos con fines ilícitos o lesivos para
              terceros.
            </p>

            <h2>Propiedad intelectual e industrial</h2>
            <p>
              Los contenidos de este sitio, incluidos textos, diagramas, código y
              elementos gráficos, son titularidad del titular del sitio salvo
              indicación expresa en contrario, y están protegidos por la
              normativa de propiedad intelectual e industrial.
            </p>

            <h2>Responsabilidad</h2>
            <p>
              El titular no se responsabiliza del uso que terceros hagan de la
              información publicada, ni de los daños derivados de un uso
              inadecuado del sitio. Los ejemplos y cálculos publicados tienen
              carácter ilustrativo y no constituyen una garantía de resultado.
            </p>

            <h2>Legislación aplicable</h2>
            <p>
              Estas condiciones se rigen por la legislación española. Para
              cualquier controversia serán competentes los juzgados y tribunales
              que correspondan conforme a la normativa aplicable.
            </p>
          </Prose>
        </Container>
      </Section>
    </>
  );
}
