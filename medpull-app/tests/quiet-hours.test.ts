import { describe, expect, it } from "vitest";
import { withinQuietHours, isSendableHour, localHour } from "@/lib/quiet-hours";

// A fixed instant: 2026-06-15T03:00:00Z.
// In America/Los_Angeles (UTC-7 in June) that's 20:00 (8pm) — sendable.
// In America/New_York (UTC-4) that's 23:00 (11pm) — quiet.
const instant = new Date("2026-06-15T03:00:00Z");

describe("quiet hours", () => {
  it("computes local hour per timezone", () => {
    expect(localHour(instant, "America/Los_Angeles")).toBe(20);
    expect(localHour(instant, "America/New_York")).toBe(23);
  });

  it("8pm Pacific is still sendable, 11pm Eastern is quiet", () => {
    expect(withinQuietHours(instant, "America/Los_Angeles")).toBe(false);
    expect(withinQuietHours(instant, "America/New_York")).toBe(true);
  });

  it("blocks early morning and late night", () => {
    const sevenAm = new Date("2026-06-15T14:00:00Z"); // 7am Pacific
    const nineAm = new Date("2026-06-15T16:00:00Z"); // 9am Pacific
    expect(withinQuietHours(sevenAm, "America/Los_Angeles")).toBe(true);
    expect(withinQuietHours(nineAm, "America/Los_Angeles")).toBe(false);
  });

  it("isSendableHour is the inverse", () => {
    expect(isSendableHour(instant, "America/Los_Angeles")).toBe(true);
    expect(isSendableHour(instant, "America/New_York")).toBe(false);
  });

  it("falls back gracefully for an invalid timezone", () => {
    expect(() => withinQuietHours(instant, "Not/AZone")).not.toThrow();
  });
});
