import { beforeEach, describe, expect, it } from "vitest";

import { rateLimit, resetRateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimit();
  });

  it("allows the first five requests from a client", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(rateLimit("1.2.3.4").ok, `attempt ${attempt}`).toBe(true);
    }
  });

  it("blocks the sixth and reports when to retry", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) rateLimit("1.2.3.4");
    const blocked = rateLimit("1.2.3.4");
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("keeps clients independent", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) rateLimit("1.2.3.4");
    expect(rateLimit("5.6.7.8").ok).toBe(true);
  });

  it("lets a client through again once the window has passed", () => {
    const start = 1_000_000;
    for (let attempt = 0; attempt < 5; attempt += 1) rateLimit("1.2.3.4", start);
    expect(rateLimit("1.2.3.4", start).ok).toBe(false);
    expect(rateLimit("1.2.3.4", start + 11 * 60 * 1000).ok).toBe(true);
  });
});
