import { expect, test } from "@playwright/test";

/**
 * El formulario de diagnóstico.
 *
 * No se envía de verdad en las pruebas: un envío válido escribiría una
 * solicitud en la base. Lo que se comprueba es lo que puede romperse sin que
 * nadie se entere: que valida, que los desplegables de la casa funcionan con
 * teclado y que ninguna página dice «enviado» sin estarlo.
 */
test.describe("diagnóstico", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/diagnostico");
  });

  test("exige los campos obligatorios y no envía nada", async ({ page }) => {
    let posted = false;
    await page.route("**/api/diagnostico", (route) => {
      posted = true;
      return route.abort();
    });

    await page.getByRole("button", { name: /Pedir la conversación/i }).click();

    await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
    await expect(page.getByText("Dinos el nombre de tu empresa.")).toBeVisible();
    await expect(page.getByText("Elige tu sector").first()).toBeVisible();
    expect(posted).toBe(false);
  });

  test("el desplegable propio se abre y elige con el teclado", async ({ page }) => {
    const sector = page.getByRole("combobox").first();
    // La hidratación tiene que haber llegado antes de teclear: hasta entonces
    // el botón está pintado pero sordo.
    await expect(sector).toHaveAttribute("aria-expanded", "false");
    await sector.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toBeHidden();

    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeHidden();
    await expect(sector).not.toHaveText(/Elige tu sector/);
    // El valor viaja en el formulario, no solo en pantalla.
    await expect(page.locator('input[name="sector"]')).not.toHaveValue("");
  });

  test("la calculadora enseña la cuenta y distingue facturación de beneficio", async ({ page }) => {
    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText("La cuenta")).toBeVisible();
    await expect(panel.getByText(/Facturación adicional al mes/)).toBeVisible();
    await page.getByRole("tab", { name: "Costes" }).click();
    await expect(panel.getByText(/Ahorro al año/)).toBeVisible();
    await expect(panel.getByText(/no hay que descontarle margen/)).toBeVisible();
  });
});
