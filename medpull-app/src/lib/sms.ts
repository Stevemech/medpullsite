/**
 * Twilio SMS module (p3-1).
 *
 * The single send path for all outbound SMS. DRY_RUN is the default: unless
 * SMS_DRY_RUN is explicitly "false" AND all Twilio credentials are present,
 * messages are written to the Message table + console instead of being sent.
 * This keeps the whole follow-up system safe to run with no credentials.
 *
 * p3-2 (sequence engine) and p3-3 (opt-out + quiet hours) call sendSms(); the
 * suppression and quiet-hours guards live here so every caller is covered.
 */
import { prisma } from "@/lib/db";
import { isSuppressed } from "@/lib/suppression";
import { withinQuietHours } from "@/lib/quiet-hours";

export type SendMode = "live" | "dry_run";

export type SendSmsInput = {
  to: string;
  body: string;
  leadId?: string;
  sequenceStep?: string;
  /** Lead-local IANA timezone for quiet-hours checks (p3-3). */
  timezone?: string;
  /** Skip the quiet-hours guard (e.g. for immediate transactional replies). */
  ignoreQuietHours?: boolean;
};

export type SendSmsResult = {
  status: "dry_run" | "sent" | "failed" | "skipped_suppressed" | "skipped_quiet_hours";
  mode: SendMode;
  messageId?: string;
  providerSid?: string;
  error?: string;
};

type TwilioCreds = {
  accountSid: string;
  authToken: string;
  fromNumber: string;
};

function readCreds(): TwilioCreds | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (accountSid && authToken && fromNumber) return { accountSid, authToken, fromNumber };
  return null;
}

/**
 * Resolve whether we actually send. DRY_RUN is on by default. We only go live
 * when SMS_DRY_RUN === "false" AND credentials exist. Missing creds always
 * force dry-run regardless of the flag.
 */
export function resolveSendMode(
  flag: string | undefined,
  hasCreds: boolean
): SendMode {
  const dryRunRequested = flag !== "false"; // default true
  if (dryRunRequested) return "dry_run";
  return hasCreds ? "live" : "dry_run";
}

export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const creds = readCreds();
  const mode = resolveSendMode(process.env.SMS_DRY_RUN, creds !== null);

  // p3-3: never message a suppressed number.
  if (await isSuppressed(input.to)) {
    await logMessage(input, "skipped_suppressed", { fromNumber: creds?.fromNumber });
    return { status: "skipped_suppressed", mode };
  }

  // p3-3: respect quiet hours unless explicitly bypassed.
  if (!input.ignoreQuietHours) {
    const quiet = withinQuietHours(new Date(), input.timezone);
    if (quiet) {
      await logMessage(input, "skipped_quiet_hours", { fromNumber: creds?.fromNumber });
      return { status: "skipped_quiet_hours", mode };
    }
  }

  if (mode === "dry_run") {
    const msg = await logMessage(input, "dry_run", { fromNumber: creds?.fromNumber });
    console.log(
      `[sms dry-run] to=${input.to} body="${truncate(input.body)}"${
        input.sequenceStep ? ` step=${input.sequenceStep}` : ""
      }`
    );
    return { status: "dry_run", mode, messageId: msg.id };
  }

  // Live send via Twilio REST API (no SDK dependency).
  try {
    const sid = await twilioSend(creds as TwilioCreds, input.to, input.body);
    const msg = await logMessage(input, "sent", {
      fromNumber: (creds as TwilioCreds).fromNumber,
      providerSid: sid,
      sentAt: new Date(),
    });
    return { status: "sent", mode, messageId: msg.id, providerSid: sid };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const msg = await logMessage(input, "failed", {
      fromNumber: (creds as TwilioCreds).fromNumber,
      error,
    });
    return { status: "failed", mode, messageId: msg.id, error };
  }
}

async function twilioSend(creds: TwilioCreds, to: string, body: string): Promise<string> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/Messages.json`;
  const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: creds.fromNumber, Body: body }),
  });
  const data = (await res.json()) as { sid?: string; message?: string };
  if (!res.ok) throw new Error(data.message || `Twilio error ${res.status}`);
  return data.sid as string;
}

async function logMessage(
  input: SendSmsInput,
  status: SendSmsResult["status"],
  extra: { fromNumber?: string; providerSid?: string; error?: string; sentAt?: Date }
) {
  return prisma.message.create({
    data: {
      leadId: input.leadId ?? null,
      to: input.to,
      fromNumber: extra.fromNumber ?? null,
      body: input.body,
      direction: "outbound",
      status,
      providerSid: extra.providerSid ?? null,
      error: extra.error ?? null,
      sequenceStep: input.sequenceStep ?? null,
      sentAt: extra.sentAt ?? null,
    },
  });
}

function truncate(s: string, n = 60): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
