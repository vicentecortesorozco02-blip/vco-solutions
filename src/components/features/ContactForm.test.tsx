import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "./ContactForm";

/**
 * The form is the only conversion surface on the site, so it gets real tests:
 * it must not submit garbage, must explain what is wrong, and must never claim
 * success when the request failed.
 */

afterEach(() => {
  vi.restoreAllMocks();
});

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nombre"), "Ana");
  await user.type(screen.getByLabelText("Empresa"), "Talleres Ruiz");
  await user.type(screen.getByLabelText("Email"), "ana@example.com");
  await user.type(
    screen.getByLabelText(/Qué tarea o proceso/),
    "Cada presupuesto nos lleva media hora y lo hace siempre la misma persona.",
  );
  await user.click(screen.getByRole("checkbox"));
}

describe("ContactForm", () => {
  it("blocks submission and explains why when fields are empty", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<ContactForm />);
    await user.click(screen.getByRole("button", { name: /Enviar/ }));

    expect(await screen.findByText(/Escribe tu nombre/)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("marks the offending field as invalid for assistive technology", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Email"), "ana@");
    await user.click(screen.getByRole("button", { name: /Enviar/ }));

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    });
  });

  it("posts the submission and confirms it", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    render(<ContactForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /Enviar/ }));

    expect(await screen.findByText(/Recibido/)).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledWith("/api/contacto", expect.any(Object));
  });

  it("never reports success when delivery fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "not_configured" }), { status: 503 }),
    );

    render(<ContactForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /Enviar/ }));

    expect(await screen.findByText(/No hemos podido enviarlo/)).toBeInTheDocument();
    expect(screen.queryByText(/Recibido/)).not.toBeInTheDocument();
  });

  it("hides the honeypot from people and from the tab order", () => {
    const { container } = render(<ContactForm />);
    const honeypot = container.querySelector<HTMLInputElement>('input[name="website"]');

    expect(honeypot).not.toBeNull();
    expect(honeypot).not.toBeVisible();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});
