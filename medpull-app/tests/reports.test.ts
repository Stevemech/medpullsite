import { describe, expect, it } from "vitest";
import { funnelRates } from "@/lib/reports";

describe("funnel rate math", () => {
  it("computes start, completion, overall, and drop-off rates", () => {
    const r = funnelRates(100, 60, 30);
    expect(r.startRate).toBeCloseTo(0.6);
    expect(r.completionRate).toBeCloseTo(0.5);
    expect(r.overallRate).toBeCloseTo(0.3);
    expect(r.dropoffRate).toBeCloseTo(0.5);
  });

  it("is safe with zero views/starts", () => {
    const r = funnelRates(0, 0, 0);
    expect(r.startRate).toBe(0);
    expect(r.completionRate).toBe(0);
    expect(r.overallRate).toBe(0);
    expect(r.dropoffRate).toBe(0);
  });

  it("drop-off is the complement of completion", () => {
    const r = funnelRates(50, 40, 10);
    expect(r.completionRate + r.dropoffRate).toBeCloseTo(1);
  });
});
