/**
 * Automated follow-up sequence (p3-2).
 *
 * Ordered steps with a delay (hours after the lead was created) and a message
 * template. The engine sends each step once, in order, when it becomes due —
 * all through the p3-1 SMS module (so DRY_RUN, suppression, and quiet hours
 * apply automatically).
 *
 * TODO(steve): tune the cadence and rewrite the copy with approved,
 * TCPA-compliant language before sending to real leads.
 */

export type SequenceLead = {
  contactName: string;
  clinicName: string;
};

export type SequenceStep = {
  id: string;
  /** Hours after lead.createdAt when this step becomes due. */
  afterHours: number;
  /** Message body builder. Keep it short and consent-aware. */
  body: (lead: SequenceLead) => string;
};

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || "there";
}

export const FOLLOWUP_SEQUENCE: SequenceStep[] = [
  {
    id: "welcome",
    afterHours: 0,
    body: (l) =>
      `Hi ${firstName(l.contactName)}, it's MedPull — thanks for your interest in an AI front desk for ${l.clinicName}. Reply here with any questions, or grab a time: <booking-link>. Reply STOP to opt out.`,
  },
  {
    id: "day-1",
    afterHours: 24,
    body: (l) =>
      `Hi ${firstName(l.contactName)}, following up from MedPull. Most clinics are live in under two weeks with no change to their phone number. Want a quick walkthrough? Reply STOP to opt out.`,
  },
  {
    id: "day-3",
    afterHours: 72,
    body: (l) =>
      `${firstName(l.contactName)}, every missed call at ${l.clinicName} is a patient who may book elsewhere. Happy to show you what MedPull recovers — just reply. Reply STOP to opt out.`,
  },
  {
    id: "week-1",
    afterHours: 168,
    body: (l) =>
      `Hi ${firstName(l.contactName)}, last note from MedPull for now — we'd love to have ${l.clinicName} in our pilot. Reply anytime and we'll set things up. Reply STOP to opt out.`,
  },
];

/**
 * Pure due-step selection: returns the ids of steps that are due at `now` given
 * the lead's creation time and which step ids have already been completed.
 * Steps fire in order; a step is due once `afterHours` has elapsed.
 */
export function dueSteps(
  createdAt: Date,
  completedStepIds: string[],
  now: Date,
  sequence: SequenceStep[] = FOLLOWUP_SEQUENCE
): string[] {
  const done = new Set(completedStepIds);
  const elapsedHours = (now.getTime() - createdAt.getTime()) / (60 * 60 * 1000);
  return sequence
    .filter((step) => !done.has(step.id) && elapsedHours >= step.afterHours)
    .map((step) => step.id);
}
