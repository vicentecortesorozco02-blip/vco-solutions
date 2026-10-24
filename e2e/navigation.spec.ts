import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/areas",
  "/areas/crecimiento-comercial",
  "/areas/experiencia-cliente",
  "/areas/eficiencia-rentabilidad",
  "/sectores",
  "/sectores/hoteles-y-alojamientos",
  "/sectores/pymes-con-equipo-administrativo",
  "/soluciones",
  "/soluciones/presupuestos-automaticos",
  "/casos",
  "/casos/presupuestos-por-correo",
  "/metodo-vco",
  "/empresa",
  "/diagnostico",
  "/contacto",
  "/legal/privacidad",
];

test.describe("rutas", () => {
  for (const path of routes) {
    test(`${path} responde y tiene un único h1`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      const headings = page.locator("h1");
      await expect(headings).toHaveCount(1);
      await expect(headings.first()).not.toBeEmpty();

      // Every page must expose the site's single conversion action somewhere
      // the visitor can actually see it, without opening a menu.
      await expect(
        page.locator('a[href="/diagnostico"]:visible, a[href="/contacto"]:visible').first(),
      ).toBeVisible();
    });
  }

  test("la ruta antigua del método redirige a la nueva", async ({ page }) => {
    const response = await page.goto("/metodo");
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/metodo-vco");
  });

  test("una ruta inexistente devuelve 404 con salida", async ({ page }) => {
    const response = await page.goto("/no-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("no existe");
  });
});

test.describe("cabecera", () => {
  test("el enlace de saltar al contenido aparece al tabular", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  });

  test("la navegación principal lleva a cada sección", async ({ page, isMobile }) => {
    test.skip(isMobile, "El menú móvil tiene su propia prueba.");

    await page.goto("/");
    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Casos" }).click();
    await expect(page).toHaveURL(/\/casos$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("menú móvil", () => {
  test("se abre, navega y se cierra con Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Solo aplica por debajo de lg.");

    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Abrir menú" });
    await toggle.click();

    const menu = page.locator("#menu-movil");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: /Sectores/ })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();

    await toggle.click();
    await menu.getByRole("link", { name: /Método VCO/ }).click();
    await expect(page).toHaveURL(/\/metodo-vco$/);
    await expect(menu).toBeHidden();
  });
});
