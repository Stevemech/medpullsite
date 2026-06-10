import { describe, expect, it } from "vitest";
import {
  recommendTier,
  estimatePrice,
  PRICING_TIERS,
} from "@/config/pricing-tiers";

describe("pricing calculator", () => {
  it("recommends Starter for a small single-location clinic", () => {
    expect(recommendTier({ monthlyCalls: 400, locations: 1 }).id).toBe("starter");
  });

  it("recommends Growth for a busier practice", () => {
    expect(recommendTier({ monthlyCalls: 2000, locations: 2 }).id).toBe("growth");
  });

  it("recommends Multi-site for high volume or many locations", () => {
    expect(recommendTier({ monthlyCalls: 5000, locations: 6 }).id).toBe("multisite");
  });

  it("includes base price with no overage when within limits", () => {
    const tier = PRICING_TIERS[0];
    const est = estimatePrice(tier, { monthlyCalls: tier.includedCalls, locations: 1 });
    expect(est.callOverage).toBe(0);
    expect(est.locationOverage).toBe(0);
    expect(est.estimatedMonthly).toBe(tier.monthlyBase);
  });

  it("charges call and location overage beyond included amounts", () => {
    const tier = PRICING_TIERS[0]; // 500 calls, 1 location
    const est = estimatePrice(tier, { monthlyCalls: 700, locations: 2 });
    // 200 extra calls => 2 * overagePer100Calls; 1 extra location
    expect(est.callOverage).toBe(2 * tier.overagePer100Calls);
    expect(est.locationOverage).toBe(tier.perExtraLocation);
    expect(est.estimatedMonthly).toBe(
      tier.monthlyBase + est.callOverage + est.locationOverage
    );
  });
});
