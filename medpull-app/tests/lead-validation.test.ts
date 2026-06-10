import { describe, expect, it } from "vitest";
import { leadSubmissionSchema, normalizePhone } from "@/lib/validators";

const valid = {
  clinicName: "Sunrise Family Clinic",
  contactName: "Dana Whitfield",
  email: "dana@sunrisefamily.example",
  phone: "(415) 555-0142",
  consent: true as const,
};

describe("leadSubmissionSchema", () => {
  it("accepts a valid submission and normalizes the phone", () => {
    const parsed = leadSubmissionSchema.parse(valid);
    expect(parsed.phone).toBe("4155550142");
    expect(parsed.source).toBe("popup");
  });

  it("rejects submissions without consent", () => {
    const res = leadSubmissionSchema.safeParse({ ...valid, consent: false });
    expect(res.success).toBe(false);
  });

  it("rejects bad emails", () => {
    const res = leadSubmissionSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(res.success).toBe(false);
  });

  it("rejects too-short phone numbers", () => {
    const res = leadSubmissionSchema.safeParse({ ...valid, phone: "555-1234" });
    expect(res.success).toBe(false);
  });

  it("keeps + prefix for E.164 numbers", () => {
    expect(normalizePhone("+1 (415) 555-0142")).toBe("+14155550142");
  });
});
