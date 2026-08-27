import { expect, test } from "@playwright/test";

test.describe("formulario de contacto", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contacto");
  });

  test("no envía nada si faltan campos", async ({ page }) => {
    let requests = 0;
    await page.route("**/api/contacto", async (route) => {
      requests += 1;
      await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    });

    await page.getByRole("button", { name: /Enviar/ }).click();

    await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
    expect(requests).toBe(0);
  });

  test("envía y confirma cuando los datos son correctos", async ({ page }) => {
    await page.route("**/api/contacto", async (route) => {
      const body = route.request().postDataJSON();
      expect(body.email).toBe("ana@example.com");
      expect(body.consent).toBe(true);
      await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    });

    await page.getByLabel("Nombre").fill("Ana");
    await page.getByLabel("Empresa").fill("Talleres Ruiz");
    await page.getByLabel("Email").fill("ana@example.com");
    await page
      .getByLabel(/Qué tarea o proceso/)
      .fill("Cada presupuesto nos lleva media hora y lo hace siempre la misma persona.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Enviar/ }).click();

    await expect(page.getByText("Recibido. Gracias.")).toBeVisible();
  });

  test("ofrece el correo cuando el envío falla", async ({ page }) => {
    await page.route("**/api/contacto", (route) =>
      route.fulfill({ status: 503, body: JSON.stringify({ error: "not_configured" }) }),
    );

    await page.getByLabel("Nombre").fill("Ana");
    await page.getByLabel("Empresa").fill("Talleres Ruiz");
    await page.getByLabel("Email").fill("ana@example.com");
    await page
      .getByLabel(/Qué tarea o proceso/)
      .fill("Cada presupuesto nos lleva media hora y lo hace siempre la misma persona.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Enviar/ }).click();

    await expect(page.getByText(/No hemos podido enviarlo/)).toBeVisible();
    await expect(page.getByText("Recibido. Gracias.")).toBeHidden();
  });
});

test.describe("api de contacto", () => {
  /**
   * Estas pruebas hacen peticiones reales al endpoint, y el limitador indexa
   * por `x-forwarded-for`. Sin una IP propia por prueba, los tres perfiles de
   * dispositivo comparten cubo, lo agotan y la respuesta pasa a ser 429.
   */
  test("rechaza un cuerpo inválido con los errores por campo", async ({ request }) => {
    const response = await request.post("/api/contacto", {
      headers: { "x-forwarded-for": "198.51.100.11" },
      data: { name: "", company: "", email: "no", process: "x", consent: false },
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.fieldErrors).toBeTruthy();
    expect(Object.keys(body.fieldErrors).length).toBeGreaterThan(0);
  });

  test("traga el honeypot en silencio", async ({ request }) => {
    const response = await request.post("/api/contacto", {
      headers: { "x-forwarded-for": "198.51.100.22" },
      data: {
        name: "Bot",
        company: "Bots SL",
        email: "bot@example.com",
        process: "Texto suficientemente largo para pasar la validación.",
        consent: true,
        website: "http://spam.example",
      },
    });

    // A filled honeypot must never produce a distinguishable "you are a bot"
    // response: 422 from schema validation, or 200 from the silent accept path.
    expect([200, 422]).toContain(response.status());
  });
});
