/**
 * Pricing tiers + calculator model (p5-3).
 *
 * ALL prices, limits, and tier definitions below are PLACEHOLDERS.
 * TODO(steve): replace with the real pricing defined in checklist task p0-8
 * (pricing tiers by clinic size). Do not present these as real prices.
 */

export type PricingTier = {
  id: string;
  name: string;
  placeholder: true;
  /** Base monthly price in whole dollars (placeholder). */
  monthlyBase: number;
  /** Inbound calls/month included before overage. */
  includedCalls: number;
  /** Locations included in the base price. */
  includedLocations: number;
  /** Overage price per 100 calls beyond the included amount (placeholder). */
  overagePer100Calls: number;
  /** Additional price per location beyond the included count (placeholder). */
  perExtraLocation: number;
  blurb: string;
  features: string[];
  recommendedMaxCalls: number; // upper bound used by the recommender
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    placeholder: true,
    monthlyBase: 299,
    includedCalls: 500,
    includedLocations: 1,
    overagePer100Calls: 40,
    perExtraLocation: 149,
    blurb: "For a single-location clinic getting its phones under control.",
    features: [
      "24/7 AI call answering",
      "Appointment booking to one calendar",
      "Text-back on missed calls",
      "Interest popup + lead capture",
    ],
    recommendedMaxCalls: 800,
  },
  {
    id: "growth",
    name: "Growth",
    placeholder: true,
    monthlyBase: 699,
    includedCalls: 1500,
    includedLocations: 2,
    overagePer100Calls: 32,
    perExtraLocation: 119,
    blurb: "For busy practices that live and die by the schedule.",
    features: [
      "Everything in Starter",
      "Automated follow-up sequences",
      "Lead scoring + admin dashboard",
      "Quiet-hours & opt-out compliance",
    ],
    recommendedMaxCalls: 3000,
  },
  {
    id: "multisite",
    name: "Multi-site",
    placeholder: true,
    monthlyBase: 1499,
    includedCalls: 4000,
    includedLocations: 5,
    overagePer100Calls: 25,
    perExtraLocation: 99,
    blurb: "For groups running several locations from one front desk.",
    features: [
      "Everything in Growth",
      "Per-location routing & reporting",
      "Priority onboarding",
      "EHR integration roadmap access",
    ],
    recommendedMaxCalls: Number.POSITIVE_INFINITY,
  },
];

export type CalculatorInput = {
  monthlyCalls: number;
  locations: number;
};

export type PriceEstimate = {
  tier: PricingTier;
  base: number;
  callOverage: number;
  locationOverage: number;
  estimatedMonthly: number;
};

/** Recommend the smallest tier whose recommendedMaxCalls covers the volume. */
export function recommendTier(input: CalculatorInput): PricingTier {
  return (
    PRICING_TIERS.find(
      (t) => input.monthlyCalls <= t.recommendedMaxCalls && input.locations <= t.includedLocations
    ) ??
    PRICING_TIERS.find((t) => input.monthlyCalls <= t.recommendedMaxCalls) ??
    PRICING_TIERS[PRICING_TIERS.length - 1]
  );
}

/** Estimate the monthly price for a tier given usage (placeholder model). */
export function estimatePrice(tier: PricingTier, input: CalculatorInput): PriceEstimate {
  const extraCalls = Math.max(0, input.monthlyCalls - tier.includedCalls);
  const callOverage = Math.ceil(extraCalls / 100) * tier.overagePer100Calls;
  const extraLocations = Math.max(0, input.locations - tier.includedLocations);
  const locationOverage = extraLocations * tier.perExtraLocation;
  return {
    tier,
    base: tier.monthlyBase,
    callOverage,
    locationOverage,
    estimatedMonthly: tier.monthlyBase + callOverage + locationOverage,
  };
}
