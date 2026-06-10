/**
 * Inbound SMS keyword handling (p3-3).
 *
 * Recognizes the standard carrier opt-out / opt-in keywords so STOP reliably
 * suppresses a number and START re-subscribes it. Matching is case-insensitive
 * and ignores surrounding whitespace/punctuation.
 */

const STOP_KEYWORDS = new Set([
  "stop",
  "stopall",
  "unsubscribe",
  "cancel",
  "end",
  "quit",
  "stopall",
  "revoke",
  "optout",
]);

const START_KEYWORDS = new Set(["start", "unstop", "yes", "unsubscribe-cancel", "optin"]);

export type InboundIntent = "stop" | "start" | null;

export function parseInboundKeyword(body: string): InboundIntent {
  // Match on the first token (letters only) so "STOP", "STOP.", and
  // "STOP please" all opt out, per carrier convention.
  const firstToken = body.trim().toLowerCase().split(/\s+/)[0]?.replace(/[^a-z]/g, "") ?? "";
  if (!firstToken) return null;
  if (STOP_KEYWORDS.has(firstToken)) return "stop";
  if (START_KEYWORDS.has(firstToken)) return "start";
  return null;
}
