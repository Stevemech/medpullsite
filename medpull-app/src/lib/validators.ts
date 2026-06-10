import { z } from "zod";

/** Lead lifecycle statuses (SQLite has no enums; validated here instead). */
export const LEAD_STATUSES = ["new", "contacted", "scheduled", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Normalize a US-ish phone number to digits (keeps leading + for E.164). */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/[^\d]/g, "");
}

export const leadSubmissionSchema = z.object({
  clinicName: z.string().trim().min(2, "Clinic name is required").max(200),
  contactName: z.string().trim().min(2, "Contact name is required").max(200),
  email: z.string().trim().email("Enter a valid email").max(320),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((p) => p.replace("+", "").length >= 10 && p.replace("+", "").length <= 15, {
      message: "Enter a valid phone number",
    }),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required to submit this form" }),
  }),
  source: z.string().trim().max(100).optional().default("popup"),
  // p5-1: optional intern referral code captured from ?ref= on the URL.
  referralCode: z.string().trim().max(50).optional(),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

export const leadStatusSchema = z.enum(LEAD_STATUSES);
