/**
 * Commission rates for the intern referral program (p5-1).
 *
 * All amounts are PLACEHOLDERS in integer cents.
 * TODO(steve): replace with the real commission structure defined in checklist
 * task p0-7, and confirm whether commissions are flat per-event or percentage
 * of contract value.
 */

export type CommissionKind = "signup" | "conversion";

export const COMMISSION_RATES: Record<CommissionKind, { amountCents: number; label: string }> = {
  // Paid when a referred clinic first submits interest (a new attributed lead).
  signup: { amountCents: 2500, label: "Referred lead signup" }, // $25 — TODO(steve)
  // Paid when a referred lead converts (reaches the "scheduled" stage).
  conversion: { amountCents: 10000, label: "Referred lead booked a demo" }, // $100 — TODO(steve)
};

/** Lead status that triggers a "conversion" commission. TODO(steve): confirm. */
export const CONVERSION_STATUS = "scheduled";

export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
