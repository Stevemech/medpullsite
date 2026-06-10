/**
 * Follow-up sequence engine (p3-2). Walks active leads, figures out which
 * sequence steps are due, and sends them through the p3-1 SMS module. Designed
 * to be run repeatedly (cron) — it is idempotent because each step is recorded
 * in the Message table and never sent twice.
 */
import { prisma } from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { FOLLOWUP_SEQUENCE, dueSteps } from "@/config/followup-sequence";
import { defaultTimezone } from "@/lib/quiet-hours";

// A step counts as "already handled" (don't resend) when a prior attempt was
// sent, dry-run, or hit a permanent skip (opt-out). Quiet-hours skips are
// transient and will be retried on the next run.
const TERMINAL_STATUSES = new Set(["sent", "dry_run", "skipped_suppressed"]);

// Leads in these statuses are no longer in the nurture sequence.
const ACTIVE_LEAD_STATUSES = ["new"];

export type FollowupRunSummary = {
  leadsConsidered: number;
  stepsSent: number;
  stepsDryRun: number;
  stepsSkipped: number;
  stepsFailed: number;
  details: { leadId: string; step: string; status: string }[];
};

export async function runFollowups(now: Date = new Date()): Promise<FollowupRunSummary> {
  const summary: FollowupRunSummary = {
    leadsConsidered: 0,
    stepsSent: 0,
    stepsDryRun: 0,
    stepsSkipped: 0,
    stepsFailed: 0,
    details: [],
  };

  const leads = await prisma.lead.findMany({
    where: { status: { in: ACTIVE_LEAD_STATUSES }, consent: true },
    orderBy: { createdAt: "asc" },
  });

  for (const lead of leads) {
    summary.leadsConsidered++;

    // Which steps already reached a terminal state for this lead?
    const priorMessages = await prisma.message.findMany({
      where: { leadId: lead.id, sequenceStep: { not: null } },
      select: { sequenceStep: true, status: true },
    });
    const completed = priorMessages
      .filter((m) => m.sequenceStep && TERMINAL_STATUSES.has(m.status))
      .map((m) => m.sequenceStep as string);

    const due = dueSteps(lead.createdAt, completed, now);
    if (due.length === 0) continue;

    // Send at most one step per run per lead, in order, to avoid bursts.
    const stepId = due[0];
    const step = FOLLOWUP_SEQUENCE.find((s) => s.id === stepId);
    if (!step) continue;

    const result = await sendSms({
      to: lead.phone,
      body: step.body({ contactName: lead.contactName, clinicName: lead.clinicName }),
      leadId: lead.id,
      sequenceStep: step.id,
      timezone: defaultTimezone(),
    });

    summary.details.push({ leadId: lead.id, step: step.id, status: result.status });
    if (result.status === "sent") summary.stepsSent++;
    else if (result.status === "dry_run") summary.stepsDryRun++;
    else if (result.status === "failed") summary.stepsFailed++;
    else summary.stepsSkipped++;
  }

  return summary;
}
