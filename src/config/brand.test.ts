import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { brand } from "./brand";

/**
 * Guardia del desacople de identidad.
 *
 * El objetivo de la fase de branding es que aplicar un nombre real sea un
 * cambio pequeño y seguro. Eso solo se sostiene si nadie vuelve a escribir la
 * identidad a mano dentro de un componente. Estas pruebas recorren el código
 * fuente de verdad y fallan si aparece.
 *
 * Si una prueba de aquí falla, la solución nunca es relajar la prueba: es
 * mover el valor a src/config/brand.ts.
 */

const SRC = join(process.cwd(), "src");

/** Archivos donde la identidad puede aparecer literalmente, por definición. */
const ALLOWED = new Set([
  "config/brand.ts",
  "config/brand.test.ts",
]);

function sourceFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...sourceFiles(full));
      continue;
    }
    if (/\.tsx?$/.test(entry)) found.push(full);
  }
  return found;
}

const files = sourceFiles(SRC).map((path) => ({
  path: relative(SRC, path).replace(/\\/g, "/"),
  content: readFileSync(path, "utf8"),
}));

/** Código que se sirve a una persona: ni configuración, ni pruebas. */
const productionFiles = files.filter(
  (file) => !ALLOWED.has(file.path) && !file.path.includes(".test."),
);

describe("identidad desacoplada", () => {
  it("encuentra archivos que analizar", () => {
    // Red de seguridad: si el recorrido se rompe, el resto pasaría en vacío.
    expect(files.length).toBeGreaterThan(40);
  });

  it("no escribe el nombre de la marca fuera de la configuración", () => {
    // Antes vigilaba el marcador `[BRAND]`. Con la marca aplicada el riesgo es
    // el mismo y el remedio también: importar `brand`, no teclear el nombre.
    const offenders = files
      .filter((file) => !ALLOWED.has(file.path))
      .filter(
        (file) =>
          file.content.includes(brand.name) ||
          file.content.includes(brand.legalName),
      )
      .map((file) => file.path);

    expect(offenders).toEqual([]);
  });

  it("no escribe el dominio ni el correo fuera de la configuración", () => {
    // Las pruebas quedan fuera: usan direcciones de ejemplo como dato de
    // entrada, y `example.com` es precisamente el dominio reservado para eso.
    const offenders = productionFiles
      .filter(
        (file) =>
          file.content.includes(brand.domain) || file.content.includes(brand.email),
      )
      .map((file) => file.path);

    expect(offenders).toEqual([]);
  });

  it("no escribe colores hexadecimales en el código de producción", () => {
    const offenders = productionFiles
      .filter((file) =>
        file.content
          .split("\n")
          // Los comentarios pueden citar un color al explicar una decisión.
          .filter((line) => !line.trimStart().startsWith("//") && !line.trimStart().startsWith("*"))
          .some((line) => /#[0-9a-fA-F]{3,8}\b/.test(line)),
      )
      .map((file) => file.path);

    expect(offenders).toEqual([]);
  });
});

describe("configuración de marca", () => {
  it("mantiene la descripción dentro del límite de los buscadores", () => {
    expect(brand.description.length).toBeLessThanOrEqual(160);
    expect(brand.description.length).toBeGreaterThan(70);
  });

  it("declara una URL absoluta y sin barra final", () => {
    expect(brand.url).toMatch(/^https?:\/\//);
    expect(brand.url.endsWith("/")).toBe(false);
  });

  it("mantiene el espejo de la paleta en hexadecimal completo", () => {
    // La comparación contra los tokens reales se hace en e2e/brand.spec.ts,
    // que sí tiene un navegador para resolver OKLCH.
    for (const [name, value] of Object.entries(brand.colors)) {
      expect(value, name).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
