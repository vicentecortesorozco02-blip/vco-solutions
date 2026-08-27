import { describe, expect, it } from "vitest";

import { contactSchema } from "./contact-schema";

const valid = {
  name: "Ana",
  company: "Talleres Ruiz",
  email: "ana@example.com",
  phone: "",
  process: "Cada presupuesto nos lleva media hora y siempre lo hace la misma persona.",
  consent: true as const,
  website: "" as const,
};

describe("contactSchema", () => {
  it("accepts a realistic submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("trims whitespace", () => {
    const parsed = contactSchema.parse({ ...valid, name: "  Ana  " });
    expect(parsed.name).toBe("Ana");
  });

  it("rejects a malformed email", () => {
    const result = contactSchema.safeParse({ ...valid, email: "ana@" });
    expect(result.success).toBe(false);
  });

  it("requires consent", () => {
    const result = contactSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it("rejects a process description that says nothing", () => {
    const result = contactSchema.safeParse({ ...valid, process: "hola" });
    expect(result.success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    const result = contactSchema.safeParse({ ...valid, website: "http://spam" });
    expect(result.success).toBe(false);
  });

  it("caps the message length", () => {
    const result = contactSchema.safeParse({ ...valid, process: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("returns messages in Spanish", () => {
    const result = contactSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/nombre/i);
    }
  });
});
