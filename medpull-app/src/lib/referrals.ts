/**
 * Referral attribution + commission ledger (p5-1).
 *
 * - resolveIntern: maps a ?ref= code to an active intern.
 * - accrueCommission: idempotently records a commission entry for a lead event.
 * - On lead creation with a valid code we attribute the lead and accrue a
 *   "signup" commission; when the lead reaches CONVERSION_STATUS we accrue a
 *   "conversion" commission. The @@unique([leadId, kind]) constraint makes
 *   re-runs safe (no double-crediting).
 */
import { prisma } from "@/lib/db";
import {
  COMMISSION_RATES,
  CONVERSION_STATUS,
  type CommissionKind,
} from "@/config/commissions";

export async function resolveIntern(code: string | undefined | null) {
  if (!code) return null;
  return prisma.intern.findFirst({
    where: { referralCode: code.trim(), active: true },
  });
}

export async function accrueCommission(
  internId: string,
  kind: CommissionKind,
  leadId: string | null
) {
  const rate = COMMISSION_RATES[kind];
  try {
    await prisma.commissionEntry.create({
      data: {
        internId,
        leadId,
        kind,
        amountCents: rate.amountCents,
        note: rate.label,
      },
    });
    return true;
  } catch {
    // Unique (leadId, kind) violation => already credited. Treat as no-op.
    return false;
  }
}

/** Called from the lead-create path. Returns the resolved internId, if any. */
export async function attributeLeadOnCreate(
  leadId: string,
  referralCode: string | undefined
): Promise<string | null> {
  const intern = await resolveIntern(referralCode);
  if (!intern) return null;
  await prisma.lead.update({ where: { id: leadId }, data: { internId: intern.id } });
  await accrueCommission(intern.id, "signup", leadId);
  return intern.id;
}

/** Called when a lead's status changes. Accrues a conversion commission once. */
export async function maybeAccrueConversion(leadId: string, newStatus: string) {
  if (newStatus !== CONVERSION_STATUS) return;
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead?.internId) return;
  await accrueCommission(lead.internId, "conversion", leadId);
}

export type InternStats = {
  internId: string;
  name: string;
  referralCode: string;
  referredLeads: number;
  conversions: number;
  pendingCents: number;
  approvedCents: number;
  paidCents: number;
  totalCents: number;
};

/** Stats for every active intern, highest total commission first. */
export async function listInternStats(): Promise<InternStats[]> {
  const interns = await prisma.intern.findMany({ orderBy: { createdAt: "asc" } });
  const stats = await Promise.all(interns.map((i) => internStats(i.id)));
  return stats
    .filter((s): s is InternStats => s !== null)
    .sort((a, b) => b.totalCents - a.totalCents);
}

export async function internStats(internId: string): Promise<InternStats | null> {
  const intern = await prisma.intern.findUnique({ where: { id: internId } });
  if (!intern) return null;

  const [referredLeads, conversions, commissions] = await Promise.all([
    prisma.lead.count({ where: { internId } }),
    prisma.lead.count({ where: { internId, status: CONVERSION_STATUS } }),
    prisma.commissionEntry.findMany({ where: { internId } }),
  ]);

  const sumBy = (status: string) =>
    commissions.filter((c) => c.status === status).reduce((a, c) => a + c.amountCents, 0);

  return {
    internId,
    name: intern.name,
    referralCode: intern.referralCode,
    referredLeads,
    conversions,
    pendingCents: sumBy("pending"),
    approvedCents: sumBy("approved"),
    paidCents: sumBy("paid"),
    totalCents: commissions.reduce((a, c) => a + c.amountCents, 0),
  };
}
