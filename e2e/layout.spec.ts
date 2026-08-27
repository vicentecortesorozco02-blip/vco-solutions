import { expect, test } from "@playwright/test";

const routes = ["/", "/soluciones/presupuestos-automaticos", "/casos", "/contacto"];

/**
 * Layout regressions.
 *
 * Horizontal overflow is the single most common way a responsive page breaks,
 * and it is invisible in a component test. This walks the real DOM and fails
 * with the offending element, not just a boolean.
 */
test.describe("maquetación", () => {
  for (const path of routes) {
    test(`${path} no desborda horizontalmente`, async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);

      const offenders = await page.evaluate(() => {
        const limit = document.documentElement.clientWidth;
        const bad: string[] = [];
        for (const element of document.querySelectorAll("body *")) {
          const box = element.getBoundingClientRect();
          if (box.width === 0) continue;
          if (box.right > limit + 1 || box.left < -1) {
            bad.push(
              `${element.tagName.toLowerCase()}.${String(element.className).slice(0, 60)}`,
            );
          }
        }
        return bad;
      });

      expect(offenders).toEqual([]);
    });
  }

  /**
   * WCAG 2.2 AA (2.5.8) asks for 24x24 CSS pixels. We hold ourselves to 32 for
   * standalone controls, and to 44 for the primary actions, which is what the
   * Button component enforces.
   */
  const MIN_TARGET = 32;

  for (const path of ["/", "/contacto"]) {
    test(`${path}: los objetivos táctiles cumplen el mínimo en móvil`, async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, "Solo relevante en pantallas táctiles.");

      await page.goto(path);
      const small = await page.evaluate((min) => {
        const bad: string[] = [];
        for (const element of document.querySelectorAll("a, button")) {
          const box = element.getBoundingClientRect();
          // Visually hidden helpers (skip link, sr-only labels) are not targets
          // until they are focused, at which point they get real dimensions.
          if (box.width <= 4 || box.height <= 4) continue;
          // WCAG 2.5.8 exempts links that sit inline inside a sentence, which
          // is what these are: prose, list rows and the consent label.
          if (element.closest("p, li, label")) continue;
          if (box.height < min) {
            bad.push(`${element.textContent?.trim().slice(0, 40)} (${Math.round(box.height)}px)`);
          }
        }
        return bad;
      }, MIN_TARGET);

      expect(small).toEqual([]);
    });
  }
});

test.describe("consola", () => {
  test("la home no registra errores", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));

    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);

    expect(errors).toEqual([]);
  });
});
