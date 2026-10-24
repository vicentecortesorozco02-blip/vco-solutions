import { describe, expect, it } from "vitest";

import { emptyLifeData, type LifeData } from "./agenda";
import { safeName, VAULT_FOLDER, vaultFiles } from "./markdown";
import type { Project, Subscription } from "./model";

const today = "2026-10-16";
const stamp = "2026-10-16T10:00:00.000Z";

const base = { id: "x", user_id: "u", created_at: stamp, updated_at: stamp };

const project = (over: Partial<Project> = {}): Project =>
  ({
    ...base,
    id: "p1",
    name: "WAT / We Are: Transfers",
    description: null,
    status: "active",
    priority: "normal",
    progress: 40,
    start_date: null,
    target_date: null,
    url: null,
    notes: null,
    color: "mint",
    ...over,
  }) as Project;

const subscription = (over: Partial<Subscription> = {}): Subscription =>
  ({
    ...base,
    id: "s1",
    name: "Claude",
    company: null,
    amount: null,
    amount_status: "unknown",
    amount_as_of: null,
    tax: "unknown",
    frequency: "unknown",
    custom_days: null,
    next_charge_date: null,
    date_status: "unknown",
    status: "review",
    active: true,
    category: "ai",
    scope: "pending",
    project_id: null,
    merchant: null,
    observed_account_id: null,
    target_account_id: null,
    account_change: "none",
    commitment: null,
    commitment_until: null,
    payment_method: null,
    url: null,
    source: null,
    notes: null,
    import_key: null,
    ...over,
  }) as Subscription;

const build = (over: Partial<LifeData> = {}) => vaultFiles({ ...emptyLifeData, ...over }, today, stamp);
const find = (files: ReturnType<typeof build>, path: string) => files.find((file) => file.path === path)!;

describe("las notas del vault", () => {
  it("escribe una nota por pantalla y una por proyecto", () => {
    const files = build({ projects: [project(), project({ id: "p2", name: "YourHotelWeb" })] });
    const paths = files.map((file) => file.path);
    expect(paths).toContain("Hoy.md");
    expect(paths).toContain("Tareas.md");
    expect(paths).toContain("Dinero.md");
    expect(paths).toContain("Proyectos.md");
    expect(paths).toContain("Proyectos/YourHotelWeb.md");
    expect(paths).toContain("Inbox/Léeme.md");
    expect(VAULT_FOLDER).toBe("Life CRM");
  });

  it("limpia los nombres que Windows no acepta en un fichero", () => {
    expect(safeName("WAT / We Are: Transfers")).toBe("WAT We Are Transfers");
    expect(build({ projects: [project()] }).map((f) => f.path)).toContain("Proyectos/WAT We Are Transfers.md");
  });

  it("un importe que no se sabe no se escribe como 0 €", () => {
    const text = find(build({ subscriptions: [subscription()] }), "Suscripciones.md").content;
    expect(text).toContain("Claude");
    expect(text).toContain("pendiente de confirmar");
    expect(text).not.toContain("0,00 €");
  });

  it("una fecha sin frecuencia no se convierte en una serie", () => {
    const text = find(
      build({ subscriptions: [subscription({ next_charge_date: "2026-09-24", date_status: "communicated" })] }),
      "Suscripciones.md",
    ).content;
    // La fecha es pasada y no hay cada-cuánto: no hay próximo cobro que dar.
    expect(text).toContain("pendiente de confirmar");
  });

  it("cada nota dice que la escribe el panel", () => {
    for (const file of build({ projects: [project()] })) {
      expect(file.content).toContain("origen: Life CRM");
      expect(file.content).toContain("Inbox");
    }
  });
});
