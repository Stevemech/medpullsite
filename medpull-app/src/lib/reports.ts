import { prisma } from "@/lib/db";
import { LEAD_STATUSES } from "@/lib/validators";

/** Pure funnel-rate math, exported for testing. */
export function funnelRates(viewed: number, started: number, submitted: number) {
  const startRate = viewed > 0 ? started / viewed : 0;
  const completionRate = started > 0 ? submitted / started : 0;
  const overallRate = viewed > 0 ? submitted / viewed : 0;
  const dropoffRate = started > 0 ? 1 - submitted / started : 0;
  return { startRate, completionRate, overallRate, dropoffRate };
}

export type FormFunnel = {
  form: string;
  viewed: number;
  started: number;
  submitted: number;
} & ReturnType<typeof funnelRates>;

export async function formFunnels(): Promise<FormFunnel[]> {
  const rows = await prisma.formEvent.groupBy({
    by: ["form", "event"],
    _count: { _all: true },
  });
  const byForm = new Map<string, { viewed: number; started: number; submitted: number }>();
  for (const form of ["popup", "intake"]) byForm.set(form, { viewed: 0, started: 0, submitted: 0 });
  for (const r of rows) {
    const slot = byForm.get(r.form) ?? { viewed: 0, started: 0, submitted: 0 };
    if (r.event === "viewed") slot.viewed = r._count._all;
    else if (r.event === "started") slot.started = r._count._all;
    else if (r.event === "submitted") slot.submitted = r._count._all;
    byForm.set(r.form, slot);
  }
  return [...byForm.entries()].map(([form, c]) => ({
    form,
    ...c,
    ...funnelRates(c.viewed, c.started, c.submitted),
  }));
}

export type DayCount = { date: string; leads: number; intake: number };

/** Submissions per day for the last `days` days (UTC date buckets). */
export async function submissionsOverTime(days = 30): Promise<DayCount[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [leads, intakes] = await Promise.all([
    prisma.lead.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.intakeSubmission.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const buckets = new Map<string, { leads: number; intake: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    buckets.set(d.toISOString().slice(0, 10), { leads: 0, intake: 0 });
  }
  const key = (d: Date) => d.toISOString().slice(0, 10);
  for (const l of leads) {
    const b = buckets.get(key(l.createdAt));
    if (b) b.leads++;
  }
  for (const s of intakes) {
    const b = buckets.get(key(s.createdAt));
    if (b) b.intake++;
  }
  return [...buckets.entries()]
    .map(([date, c]) => ({ date, ...c }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export type StatusFunnel = { status: string; count: number };

/** Lead status funnel in lifecycle order. */
export async function leadStatusFunnel(): Promise<StatusFunnel[]> {
  const rows = await prisma.lead.groupBy({ by: ["status"], _count: { _all: true } });
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.status, r._count._all);
  return LEAD_STATUSES.map((status) => ({ status, count: counts.get(status) ?? 0 }));
}
