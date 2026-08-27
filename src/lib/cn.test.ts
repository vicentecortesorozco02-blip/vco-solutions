import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("keeps the last conflicting utility", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("keeps a font size and a text colour together", () => {
    // Regression: tailwind-merge classifies unknown `text-*` as a colour, so
    // without the extended config `text-h2` was deleted by `text-fg` and every
    // section heading silently rendered at 16px.
    const result = cn("font-display text-h2", "text-fg");
    expect(result).toContain("text-h2");
    expect(result).toContain("text-fg");
  });

  it("still resolves two competing font sizes", () => {
    expect(cn("text-h2", "text-h3")).toBe("text-h3");
  });

  it("still resolves two competing text colours", () => {
    expect(cn("text-fg", "text-fg-muted")).toBe("text-fg-muted");
  });

  it("handles conditional values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});
