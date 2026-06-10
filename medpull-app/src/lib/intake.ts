/**
 * Intake persistence (p4-3 / p4-4). Writes go through here so sensitive contact
 * fields are always encrypted at rest and every action is audited.
 */
import { prisma } from "@/lib/db";
import { encryptOptional, decryptOptional } from "@/lib/crypto";
import type { IntakeInput } from "@/lib/intake-schema";

export async function createIntake(input: IntakeInput, meta: { ip?: string } = {}) {
  const submission = await prisma.intakeSubmission.create({
    data: {
      practiceName: input.practiceName,
      website: input.website ?? null,
      specialty: input.specialty,
      city: input.city ?? null,
      state: input.state ?? null,
      locations: input.locations,
      ehrSystem: input.ehrSystem ?? null,
      schedulingSystem: input.schedulingSystem ?? null,
      phoneSystem: input.phoneSystem ?? null,
      monthlyVisits: input.monthlyVisits ?? null,
      weeklyCalls: input.weeklyCalls ?? null,
      providers: input.providers ?? null,
      missedPctEstimate: input.missedPctEstimate ?? null,
      // sensitive — encrypted at rest
      contactNameEnc: encryptOptional(input.contactName),
      contactEmailEnc: encryptOptional(input.contactEmail),
      contactPhoneEnc: encryptOptional(input.contactPhone),
      contactRoleEnc: encryptOptional(input.contactRole),
      bestTime: input.bestTime ?? null,
      notes: input.notes ?? null,
      consent: input.consent,
    },
  });

  await prisma.intakeAudit.create({
    data: {
      submissionId: submission.id,
      action: "created",
      actor: "public-intake-form",
      ip: meta.ip ?? null,
      detail: `Practice: ${input.practiceName}`,
    },
  });

  return submission;
}

export type DecryptedIntake = {
  id: string;
  practiceName: string;
  website: string | null;
  specialty: string;
  city: string | null;
  state: string | null;
  locations: number;
  ehrSystem: string | null;
  schedulingSystem: string | null;
  phoneSystem: string | null;
  monthlyVisits: number | null;
  weeklyCalls: number | null;
  providers: number | null;
  missedPctEstimate: number | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
  bestTime: string | null;
  notes: string | null;
  consent: boolean;
  status: string;
  createdAt: Date;
};

/** List intake submissions with sensitive fields decrypted (admin only). */
export async function listIntakeDecrypted(opts: {
  actor: string;
  ip?: string;
  take?: number;
}): Promise<DecryptedIntake[]> {
  const rows = await prisma.intakeSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: opts.take ?? 200,
  });

  // Audit the bulk view once.
  if (rows.length > 0) {
    await prisma.intakeAudit.create({
      data: {
        submissionId: rows[0].id,
        action: "viewed",
        actor: opts.actor,
        ip: opts.ip ?? null,
        detail: `Viewed ${rows.length} intake record(s)`,
      },
    });
  }

  return rows.map((r) => ({
    id: r.id,
    practiceName: r.practiceName,
    website: r.website,
    specialty: r.specialty,
    city: r.city,
    state: r.state,
    locations: r.locations,
    ehrSystem: r.ehrSystem,
    schedulingSystem: r.schedulingSystem,
    phoneSystem: r.phoneSystem,
    monthlyVisits: r.monthlyVisits,
    weeklyCalls: r.weeklyCalls,
    providers: r.providers,
    missedPctEstimate: r.missedPctEstimate,
    contactName: decryptOptional(r.contactNameEnc),
    contactEmail: decryptOptional(r.contactEmailEnc),
    contactPhone: decryptOptional(r.contactPhoneEnc),
    contactRole: decryptOptional(r.contactRoleEnc),
    bestTime: r.bestTime,
    notes: r.notes,
    consent: r.consent,
    status: r.status,
    createdAt: r.createdAt,
  }));
}
