import { describe, expect, it } from "vitest";
import { intakeSchema } from "@/lib/intake-schema";

const valid = {
  practiceName: "Riverside Pediatrics",
  specialty: "Pediatrics",
  locations: 2,
  ehrSystem: "Epic",
  monthlyVisits: 1200,
  contactName: "Dana Whitfield",
  contactEmail: "dana@riversidepeds.org",
  contactPhone: "(415) 555-0142",
  consent: true,
};

describe("intake schema", () => {
  it("accepts a valid submission and normalizes the phone", () => {
    const parsed = intakeSchema.parse(valid);
    expect(parsed.contactPhone).toBe("4155550142");
    expect(parsed.locations).toBe(2);
  });

  it("requires a practice name and specialty", () => {
    expect(intakeSchema.safeParse({ ...valid, practiceName: "" }).success).toBe(false);
    expect(intakeSchema.safeParse({ ...valid, specialty: "Astrology" }).success).toBe(false);
  });

  it("requires consent", () => {
    expect(intakeSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });

  it("coerces numeric strings and bounds them", () => {
    const parsed = intakeSchema.parse({ ...valid, monthlyVisits: "900", missedPctEstimate: "30" });
    expect(parsed.monthlyVisits).toBe(900);
    expect(parsed.missedPctEstimate).toBe(30);
    expect(intakeSchema.safeParse({ ...valid, missedPctEstimate: 200 }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(intakeSchema.safeParse({ ...valid, contactEmail: "nope" }).success).toBe(false);
  });
});
