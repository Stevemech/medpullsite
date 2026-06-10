import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const FORMS = new Set(["popup", "intake"]);
const EVENTS = new Set(["viewed", "started", "submitted"]);

/**
 * Records a funnel event for the reporting dashboard (p4-6). Intentionally
 * unauthenticated and best-effort: a failure here must never break a form.
 */
export async function POST(req: Request) {
  let body: { form?: string; event?: string; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!FORMS.has(body.form ?? "") || !EVENTS.has(body.event ?? "")) {
    return NextResponse.json({ ok: false, error: "Unknown form/event" }, { status: 400 });
  }
  try {
    await prisma.formEvent.create({
      data: {
        form: body.form as string,
        event: body.event as string,
        sessionId: body.sessionId?.slice(0, 64) || null,
      },
    });
  } catch {
    // swallow — analytics must not break the form
  }
  return NextResponse.json({ ok: true });
}
