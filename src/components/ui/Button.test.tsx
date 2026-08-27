import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders a link when given an href", () => {
    render(<Button href="/contacto">Cuéntanos tu proceso</Button>);
    const link = screen.getByRole("link", { name: /Cuéntanos tu proceso/ });
    expect(link).toHaveAttribute("href", "/contacto");
  });

  it("renders a button element otherwise", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("exposes analytics intent as data attributes rather than handlers", () => {
    // The delegated listener in AnalyticsBridge reads these. Keeping tracking
    // declarative is what allows CTAs to stay server components.
    render(
      <Button href="/contacto" event="cta_primary_click" eventLocation="hero" eventId="x">
        Ir
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Ir" });
    expect(link).toHaveAttribute("data-analytics-event", "cta_primary_click");
    expect(link).toHaveAttribute("data-analytics-location", "hero");
    expect(link).toHaveAttribute("data-analytics-id", "x");
  });

  it("adds no analytics attributes when no event is declared", () => {
    render(<Button href="/x">Sin medir</Button>);
    expect(screen.getByRole("link", { name: "Sin medir" })).not.toHaveAttribute(
      "data-analytics-event",
    );
  });

  it("treats external links safely", () => {
    render(<Button href="https://example.com">Fuera</Button>);
    expect(screen.getByRole("link", { name: "Fuera" })).toHaveAttribute(
      "rel",
      "noreferrer noopener",
    );
  });

  it("keeps a touch-sized target", () => {
    render(<Button>Tocar</Button>);
    expect(screen.getByRole("button", { name: "Tocar" }).className).toContain("min-h-11");
  });
});
