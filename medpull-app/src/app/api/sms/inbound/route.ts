import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseInboundKeyword } from "@/lib/opt-out";
import { addSuppression, removeSuppression } from "@/lib/suppression";

/**
 * Twilio inbound-SMS webhook (p3-3). Configure your Twilio number's "A message
 * comes in" webhook to POST here. Handles STOP/START keywords against the
 * suppression list and logs every inbound message. Replies with TwiML.
 *
 * TODO(steve): enable X-Twilio-Signature validation in production (requires the
 * public webhook URL + TWILIO_AUTH_TOKEN). Skipped here so local/dry-run works.
 */
function twiml(message?: string) {
  const body = message
    ? `<Response><Message>${escapeXml(message)}</Message></Response>`
    : `<Response></Response>`;
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  let from = "";
  let body = "";
  try {
    const form = await req.formData();
    from = String(form.get("From") || "");
    body = String(form.get("Body") || "");
  } catch {
    return twiml();
  }

  if (!from) return twiml();

  const intent = parseInboundKeyword(body);

  // Log the inbound message regardless of intent.
  await prisma.message.create({
    data: {
      to: String(process.env.TWILIO_FROM_NUMBER || ""),
      fromNumber: from,
      body,
      direction: "inbound",
      status: intent ? `inbound_${intent}` : "inbound",
    },
  });

  if (intent === "stop") {
    await addSuppression(from, "opt_out");
    return twiml(
      "You're unsubscribed from MedPull messages and won't receive more. Reply START to resubscribe."
    );
  }
  if (intent === "start") {
    await removeSuppression(from);
    return twiml("You're resubscribed to MedPull messages. Reply STOP to opt out at any time.");
  }

  // Non-keyword inbound: acknowledge quietly (a human can follow up).
  return twiml();
}
