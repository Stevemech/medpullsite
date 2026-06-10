import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/validators";
import { maybeAccrueConversion } from "@/lib/referrals";

export type LeadListParams = {
  q?: string;
  status?: string;
  sort?: "newest" | "oldest" | "score";
  take?: number;
};

/** List leads with optional free-text search and status filter. */
export async function listLeads(params: LeadListParams = {}) {
  const { q, status, sort = "newest", take = 200 } = params;

  const where: Prisma.LeadWhereInput = {};
  if (status && (LEAD_STATUSES as readonly string[]).includes(status)) {
    where.status = status;
  }
  if (q && q.trim()) {
    const term = q.trim();
    // SQLite's "contains" is case-insensitive for ASCII by default.
    where.OR = [
      { clinicName: { contains: term } },
      { contactName: { contains: term } },
      { email: { contains: term } },
      { phone: { contains: term } },
    ];
  }

  const orderBy: Prisma.LeadOrderByWithRelationInput =
    sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

  return prisma.lead.findMany({ where, orderBy, take });
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const lead = await prisma.lead.update({ where: { id }, data: { status } });
  // p5-1: accrue a conversion commission if this lead was referred.
  await maybeAccrueConversion(id, status);
  return lead;
}

export async function statusCounts(): Promise<Record<string, number>> {
  const rows = await prisma.lead.groupBy({ by: ["status"], _count: { _all: true } });
  const counts: Record<string, number> = {};
  for (const s of LEAD_STATUSES) counts[s] = 0;
  for (const r of rows) counts[r.status] = r._count._all;
  return counts;
}
