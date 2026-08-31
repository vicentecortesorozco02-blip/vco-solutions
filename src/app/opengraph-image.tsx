import { ImageResponse } from "next/og";

import { brand } from "@/config/brand";

export const alt = `${brand.name} — ${brand.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card.
 *
 * Generated rather than designed in a file so it can never fall out of sync
 * with the brand config. Deliberately typographic: no custom font is fetched
 * at build time, which keeps generation fast and removes a failure mode.
 */
export default function OpengraphImage() {
  // La imagen se genera en un worker que no puede leer CSS, así que la paleta
  // llega del espejo hexadecimal de la configuración de marca. Antes eran
  // literales escritos a mano y se habían desviado de los tokens reales: el
  // acento estaba en #b0631c cuando la marca es #ac522d. Ver docs/BRAND.md.
  const { fg: ink, bg: paper, accent, fgMuted: muted, line } = brand.colors;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: paper,
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: accent,
              transform: "rotate(45deg)",
            }}
          />
          <div style={{ fontSize: 26, color: ink, letterSpacing: -0.4 }}>
            {brand.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 62,
              lineHeight: 1.08,
              color: ink,
              letterSpacing: -1.6,
              maxWidth: 900,
            }}
          >
            Tu empresa tiene tareas que nadie debería seguir haciendo a mano.
          </div>

          <div style={{ display: "flex", fontSize: 26, color: muted, maxWidth: 780 }}>
            {brand.tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {["Correo", "Persona", "Excel", "PDF", "Respuesta"].map((step) => (
            <div
              key={step}
              style={{
                display: "flex",
                border: `1px solid ${line}`,
                color: muted,
                fontSize: 20,
                padding: "8px 14px",
                borderRadius: 4,
              }}
            >
              {step}
            </div>
          ))}
          <div style={{ display: "flex", color: muted, fontSize: 24, padding: "0 8px" }}>
            →
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: accent,
              color: paper,
              fontSize: 20,
              padding: "8px 14px",
              borderRadius: 4,
            }}
          >
            Sistema
          </div>
        </div>
      </div>
    ),
    size,
  );
}
