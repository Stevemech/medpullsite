import { z } from "zod";
import { normalizePhone } from "@/lib/validators";

/**
 * Pilot intake schema (p4-3). Validated on both client and server. Field
 * groups mirror the multi-step form so each step can validate independently.
 */

export const EHR_SYSTEMS = [
  "Epic",
  "athenahealth",
  "eClinicalWorks",
  "NextGen",
  "Practice Fusion",
  "Cerner",
  "Other",
  "None / paper",
] as const;

export const SPECIALTIES = [
  "Primary care / family medicine",
  "Pediatrics",
  "Dental",
  "Dermatology",
  "OB/GYN",
  "Orthopedics",
  "ENT",
  "Behavioral health",
  "Other",
] as const;

const optionalText = z.string().trim().max(300).optional().or(z.literal("")).transform((v) => v || undefined);

export const practiceStep = z.object({
  practiceName: z.string().trim().min(2, "Practice name is required").max(200),
  website: optionalText,
  specialty: z.enum(SPECIALTIES),
  city: optionalText,
  state: z.string().trim().max(60).optional().or(z.literal("")).transform((v) => v || undefined),
  locations: z.coerce.number().int().min(1).max(500).default(1),
});

export const systemsStep = z.object({
  ehrSystem: z.enum(EHR_SYSTEMS).optional(),
  schedulingSystem: optionalText,
  phoneSystem: optionalText,
});

export const volumeStep = z.object({
  monthlyVisits: z.coerce.number().int().min(0).max(1_000_000).optional(),
  weeklyCalls: z.coerce.number().int().min(0).max(1_000_000).optional(),
  providers: z.coerce.number().int().min(0).max(10_000).optional(),
  missedPctEstimate: z.coerce.number().int().min(0).max(100).optional(),
});

export const contactStep = z.object({
  contactName: z.string().trim().min(2, "Your name is required").max(200),
  contactRole: optionalText,
  contactEmail: z.string().trim().email("Enter a valid email").max(320),
  contactPhone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((p) => p.replace("+", "").length >= 10 && p.replace("+", "").length <= 15, {
      message: "Enter a valid phone number",
    }),
  bestTime: optionalText,
  notes: z.string().trim().max(2000).optional().or(z.literal("")).transform((v) => v || undefined),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required to submit" }),
  }),
});

export const intakeSchema = practiceStep
  .merge(systemsStep)
  .merge(volumeStep)
  .merge(contactStep);

export type IntakeInput = z.infer<typeof intakeSchema>;

/** Field names that are encrypted at rest (p4-4). */
export const SENSITIVE_FIELDS = ["contactName", "contactEmail", "contactPhone", "contactRole"] as const;
