/**
 * Suppression list (p3-3). Numbers here have opted out (STOP) or been manually
 * suppressed; the SMS module refuses to message them. Phone numbers are
 * normalized to digits (keeping a leading +) so lookups are consistent
 * regardless of formatting.
 */
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/validators";

export type SuppressionReason = "opt_out" | "manual" | "bounce";

export async function isSuppressed(phone: string): Promise<boolean> {
  const normalized = normalizePhone(phone);
  const hit = await prisma.suppression.findUnique({ where: { phone: normalized } });
  return hit !== null;
}

export async function addSuppression(phone: string, reason: SuppressionReason = "opt_out") {
  const normalized = normalizePhone(phone);
  return prisma.suppression.upsert({
    where: { phone: normalized },
    update: { reason },
    create: { phone: normalized, reason },
  });
}

export async function removeSuppression(phone: string) {
  const normalized = normalizePhone(phone);
  return prisma.suppression.deleteMany({ where: { phone: normalized } });
}

export async function listSuppressions(take = 200) {
  return prisma.suppression.findMany({ orderBy: { createdAt: "desc" }, take });
}
