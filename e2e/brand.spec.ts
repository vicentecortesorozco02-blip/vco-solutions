import { expect, test } from "@playwright/test";

import { brand } from "../src/config/brand";

/**
 * El espejo de la paleta no puede desviarse de los tokens.
 *
 * `brand.colors` existe para las superficies que no leen CSS: la imagen social
 * y `theme-color`. Al ser una copia, se desincroniza sola. Ya pasó: la imagen
 * social se generó durante toda la fase 1 con un acento distinto al del sitio.
 *
 * Esta prueba resuelve los tokens reales en un navegador —OKLCH incluido— y
 * los compara con la copia. Si falla, actualiza `brand.colors`; nunca al revés:
 * la fuente de verdad es src/config/brand.css.
 */

const PAIRS: [keyof typeof brand.colors, string][] = [
  ["bg", "--color-bg"],
  ["surface", "--color-surface"],
  ["inverse", "--color-inverse"],
  ["fg", "--color-fg"],
  ["fgMuted", "--color-fg-muted"],
  ["fgSubtle", "--color-fg-subtle"],
  ["line", "--color-line"],
  ["accent", "--color-accent"],
  ["accentFg", "--color-accent-fg"],
];

test.describe("marca", () => {
  test("el espejo hexadecimal coincide con los tokens del sistema", async ({
    page,
  }) => {
    await page.goto("/");

    const resolved = await page.evaluate((tokens) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      const root = getComputedStyle(document.documentElement);

      const toHex = (css: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return `#${[r, g, b]
          .map((channel) => channel.toString(16).padStart(2, "0"))
          .join("")}`;
      };

      return Object.fromEntries(
        tokens.map((token) => [token, toHex(root.getPropertyValue(token).trim())]),
      ) as Record<string, string>;
    }, PAIRS.map(([, token]) => token));

    const drift = PAIRS.filter(
      ([key, token]) => resolved[token] !== brand.colors[key],
    ).map(([key, token]) => `${key}: config ${brand.colors[key]} vs token ${resolved[token]}`);

    expect(drift).toEqual([]);
  });

  test("theme-color usa el fondo real de la marca", async ({ page }) => {
    await page.goto("/");
    const themeColor = await page
      .locator('meta[name="theme-color"]')
      .getAttribute("content");

    expect(themeColor?.toLowerCase()).toBe(brand.colors.bg);
  });

  test("el logotipo aparece en cabecera y pie con destino a la portada", async ({
    page,
  }) => {
    await page.goto("/");
    const marks = page.getByRole("link", { name: /inicio$/ });

    await expect(marks).toHaveCount(2);
    await expect(marks.first()).toHaveAttribute("href", "/");
  });
});
