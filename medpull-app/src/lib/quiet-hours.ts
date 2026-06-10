/**
 * Quiet-hours logic (p3-3).
 *
 * No outbound SMS outside 8am–9pm in the lead's local time. When a lead's
 * timezone is unknown we fall back to DEFAULT_LEAD_TIMEZONE (default
 * America/Los_Angeles). Pure and side-effect free so it is cheap to test.
 */

export const QUIET_HOURS = {
  // Allowed window is [startHour, endHour) in local time.
  startHour: 8, // 8:00 inclusive
  endHour: 21, // 21:00 exclusive (9pm)
};

export function defaultTimezone(): string {
  return process.env.DEFAULT_LEAD_TIMEZONE || "America/Los_Angeles";
}

/** The local hour (0–23) at `date` in `timeZone`, via Intl (no deps). */
export function localHour(date: Date, timeZone: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hour12: false,
  });
  // "24" can appear for midnight in some environments; normalize to 0.
  const hour = Number(fmt.format(date));
  return hour === 24 ? 0 : hour;
}

/** True when `date` falls OUTSIDE the allowed sending window (i.e. quiet). */
export function withinQuietHours(date: Date, timeZone?: string): boolean {
  const tz = timeZone || defaultTimezone();
  let hour: number;
  try {
    hour = localHour(date, tz);
  } catch {
    // Invalid timezone string — fall back to the default rather than crash.
    hour = localHour(date, defaultTimezone());
  }
  return hour < QUIET_HOURS.startHour || hour >= QUIET_HOURS.endHour;
}

/** Convenience inverse for callers that read better as "is it OK to send?". */
export function isSendableHour(date: Date, timeZone?: string): boolean {
  return !withinQuietHours(date, timeZone);
}
