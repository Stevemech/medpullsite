/**
 * Lead scoring configuration (p2-2).
 *
 * Scores are the sum of every rule whose `applies()` predicate is true. The
 * weights and tier thresholds below are DOCUMENTED DEFAULTS — sensible starting
 * points, not tuned values.
 *
 * TODO(steve): tune these weights and thresholds against real conversion data,
 * and align them with the high-intent signals defined in checklist task p0-6.
 *
 * Adding a rule: append to SCORING_RULES with a stable id, a human description,
 * a weight, and a predicate over the lead. Keep weights roughly additive so the
 * tier thresholds stay meaningful.
 */

export type ScorableLead = {
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  consent: boolean;
  source: string;
  createdAt: Date | string;
};

export type ScoringRule = {
  id: string;
  description: string;
  weight: number;
  applies: (lead: ScorableLead, now: number) => boolean;
};

const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
];

function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase() : "";
}

const DAY = 24 * 60 * 60 * 1000;

export const SCORING_RULES: ScoringRule[] = [
  {
    id: "consent",
    description: "Gave messaging consent (reachable by SMS/calls)",
    weight: 20,
    applies: (l) => l.consent === true,
  },
  {
    id: "work-email",
    description: "Used a work/clinic email domain (not a free provider)",
    weight: 15,
    applies: (l) => {
      const d = emailDomain(l.email);
      return Boolean(d) && !FREE_EMAIL_DOMAINS.includes(d);
    },
  },
  {
    id: "valid-phone",
    description: "Provided a plausibly valid phone number",
    weight: 10,
    applies: (l) => l.phone.replace(/\D/g, "").length >= 10,
  },
  {
    id: "named-clinic",
    description: "Named a real-looking clinic (4+ characters)",
    weight: 5,
    applies: (l) => l.clinicName.trim().length >= 4,
  },
  {
    id: "high-intent-source",
    description: "Came from a high-intent source (pilot intake or referral)",
    weight: 25,
    applies: (l) => ["intake", "pilot-intake", "referral"].includes(l.source),
  },
  {
    id: "mid-intent-source",
    description: "Came from a mid-intent source (interest popup)",
    weight: 10,
    applies: (l) => ["popup"].includes(l.source),
  },
  {
    id: "fresh-48h",
    description: "Submitted within the last 48 hours (act fast)",
    weight: 15,
    applies: (l, now) => now - new Date(l.createdAt).getTime() <= 2 * DAY,
  },
  {
    id: "recent-7d",
    description: "Submitted within the last 7 days",
    weight: 5,
    applies: (l, now) => {
      const age = now - new Date(l.createdAt).getTime();
      return age > 2 * DAY && age <= 7 * DAY;
    },
  },
];

/** Tier thresholds (inclusive lower bounds). TODO(steve): tune. */
export const SCORE_TIERS: { tier: string; min: number }[] = [
  { tier: "hot", min: 60 },
  { tier: "warm", min: 40 },
  { tier: "cool", min: 20 },
  { tier: "cold", min: 0 },
];

export type LeadScore = {
  score: number;
  tier: string;
  matched: { id: string; description: string; weight: number }[];
};

export function scoreLead(lead: ScorableLead, now: number = nowMs()): LeadScore {
  const matched = SCORING_RULES.filter((r) => r.applies(lead, now)).map((r) => ({
    id: r.id,
    description: r.description,
    weight: r.weight,
  }));
  const score = matched.reduce((sum, r) => sum + r.weight, 0);
  const tier = SCORE_TIERS.find((t) => score >= t.min)?.tier ?? "cold";
  return { score, tier, matched };
}

// Indirection so tests can pass a fixed `now`; defaults to current time.
function nowMs(): number {
  return Date.now();
}
