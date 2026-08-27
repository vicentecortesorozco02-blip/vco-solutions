import type { Metadata } from "next";

import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { brand } from "@/config/brand";
import { routes } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidad",
  description: "Cómo tratamos los datos personales que nos facilitas.",
  path: routes.legal.privacy,
  index: false,
});

/** NOT LEGAL ADVICE. See the note in aviso-legal/page.tsx. */
export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Política de privacidad"
        crumbs={[
          { name: "Inicio", path: routes.home },
          { name: "Privacidad", path: routes.legal.privacy },
        ]}
      />

      <Section tone="paper" rhythm="tight">
        <Container>
          <Prose>
            <p>
              <strong>Pendiente de revisión legal.</strong> El tratamiento
              descrito aquí es el que realiza hoy el sitio. Los datos
              identificativos del responsable se completarán al constituir la
              sociedad.
            </p>

            <h2>Responsable del tratamiento</h2>
            <ul>
              <li>{brand.legalName}</li>
              <li>NIF: {brand.taxId}</li>
              <li>
                Contacto: <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </li>
            </ul>

            <h2>Qué datos tratamos y con qué finalidad</h2>
            <p>
              Únicamente los que nos facilitas voluntariamente en el formulario
              de contacto: nombre, empresa, correo electrónico, teléfono si lo
              indicas, y la descripción del proceso sobre el que nos escribes.
              Los usamos solo para responderte y, si decidimos trabajar juntos,
              para gestionar esa relación.
            </p>

            <h2>Base jurídica</h2>
            <p>
              Tu consentimiento, que otorgas al marcar la casilla del formulario,
              y el interés legítimo en atender consultas comerciales dirigidas a
              nosotros.
            </p>

            <h2>Conservación</h2>
            <p>
              Conservamos los mensajes mientras dure la conversación y, después,
              durante el plazo necesario para atender posibles responsabilidades
              legales. Puedes pedirnos su supresión en cualquier momento.
            </p>

            <h2>Destinatarios</h2>
            <p>
              No cedemos tus datos a terceros con fines comerciales. Sí
              utilizamos proveedores tecnológicos que actúan como encargados del
              tratamiento (alojamiento del sitio y correo electrónico), con los
              contratos correspondientes. [PENDIENTE: detallar proveedores
              concretos y ubicación de los servidores.]
            </p>

            <h2>Tus derechos</h2>
            <p>
              Puedes ejercer los derechos de acceso, rectificación, supresión,
              oposición, limitación y portabilidad escribiendo a{" "}
              <a href={`mailto:${brand.email}`}>{brand.email}</a>. También puedes
              reclamar ante la Agencia Española de Protección de Datos si
              consideras que no hemos atendido correctamente tu solicitud.
            </p>

            <h2>Seguridad</h2>
            <p>
              El sitio se sirve por conexión cifrada y el formulario incorpora
              medidas contra el envío automatizado. Aplicamos medidas técnicas y
              organizativas razonables para proteger la información que nos
              envías.
            </p>
          </Prose>
        </Container>
      </Section>
    </>
  );
}
