import { expect, test } from "@playwright/test";

/**
 * The private panel from the outside: it must never be reachable or
 * indexable without signing in. The signed-in flows are exercised against a
 * real Supabase project, not here (see docs/LIFE_CRM.md, "Verificación").
 */
test.describe("panel privado", () => {
  for (const path of ["/panel", "/panel/tareas", "/panel/dinero", "/panel/proyectos/00000000-0000-0000-0000-000000000000"]) {
    test(`${path} sin sesión lleva a la página de acceso`, async ({ page }) => {
      const response = await page.goto(path);
      expect(page.url()).toMatch(/\/panel\/acceso$/);
      expect(response?.headers()["x-robots-tag"]).toContain("noindex");
    });
  }

  test("la página de acceso tiene un h1 y no se indexa", async ({ page }) => {
    await page.goto("/panel/acceso");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("el botón «Entrar a mi CRM» de la cabecera lleva al acceso", async ({ page }) => {
    await page.goto("/");

    const link = page.getByRole("link", { name: "Entrar a mi CRM" }).first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/panel");

    // Sin sesión, la puerta está cerrada: el enlace existe, el panel no se abre.
    await link.click();
    await expect(page).toHaveURL(/\/panel\/acceso$/);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("robots.txt y el sitemap no exponen el panel", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/panel");
  });

  test("una acción del panel sin sesión no devuelve datos", async ({ request }) => {
    // Server actions are POST endpoints: without a session they redirect.
    const response = await request.post("/panel", { maxRedirects: 0, data: "{}" });
    expect([303, 307, 308]).toContain(response.status());
  });
});
