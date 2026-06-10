import { NextResponse } from "next/server";
import { intakeSchema } from "@/lib/intake-schema";
import { createIntake } from "@/lib/intake";
import { isEncryptionConfigured } from "@/lib/crypto";

export async function POST(req: Request) {
  if (!isEncryptionConfigured()) {
    // Refuse to accept sensitive intake data we cannot encrypt at rest.
    return NextResponse.json(
      { ok: false, error: "Intake is temporarily unavailable (server not configured)." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = intakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;

  const submission = await createIntake(parsed.data, { ip });
  return NextResponse.json({ ok: true, id: submission.id }, { status: 201 });
}
