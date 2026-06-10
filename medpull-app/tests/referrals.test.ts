import { describe, expect, it } from "vitest";
import { COMMISSION_RATES, formatCents } from "@/config/commissions";

describe("commission config", () => {
  it("has placeholder rates for signup and conversion", () => {
    expect(COMMISSION_RATES.signup.amountCents).toBeGreaterThan(0);
    expect(COMMISSION_RATES.conversion.amountCents).toBeGreaterThan(
      COMMISSION_RATES.signup.amountCents
    );
  });

  it("formats cents as currency", () => {
    expect(formatCents(2500)).toBe("$25.00");
    expect(formatCents(10000)).toBe("$100.00");
    expect(formatCents(0)).toBe("$0.00");
  });
});
