import { describe, expect, it } from "vitest";
import { scoreLead } from "@/config/lead-scoring";

const base = {
  clinicName: "Sunrise Family Clinic",
  contactName: "Dana Whitfield",
  email: "dana@sunrisefamily.org",
  phone: "4155550142",
  consent: true,
  source: "popup",
  createdAt: new Date(),
};

describe("lead scoring", () => {
  const now = Date.now();

  it("scores a strong, fresh, consented work-email lead as hot", () => {
    const { score, tier, matched } = scoreLead({ ...base }, now);
    // consent 20 + work-email 15 + valid-phone 10 + named-clinic 5 + popup 10 + fresh 15 = 75
    expect(score).toBe(75);
    expect(tier).toBe("hot");
    expect(matched.map((m) => m.id)).toContain("consent");
  });

  it("penalizes free email and missing consent", () => {
    const weak = {
      ...base,
      email: "someone@gmail.com",
      consent: false,
      source: "unknown",
    };
    const { score } = scoreLead(weak, now);
    // valid-phone 10 + named-clinic 5 + fresh 15 = 30
    expect(score).toBe(30);
  });

  it("rewards high-intent sources", () => {
    const intake = scoreLead({ ...base, source: "intake" }, now);
    const popup = scoreLead({ ...base, source: "popup" }, now);
    expect(intake.score).toBeGreaterThan(popup.score);
  });

  it("decays with age", () => {
    const old = scoreLead(
      { ...base, createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000) },
      now
    );
    const fresh = scoreLead(base, now);
    expect(fresh.score).toBeGreaterThan(old.score);
  });

  it("assigns cold tier to a bare lead", () => {
    const bare = {
      clinicName: "",
      contactName: "",
      email: "x@gmail.com",
      phone: "123",
      consent: false,
      source: "unknown",
      createdAt: new Date(now - 365 * 24 * 60 * 60 * 1000),
    };
    expect(scoreLead(bare, now).tier).toBe("cold");
  });
});
