import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { leadSubmissionSchema } from "@/lib/validators";
import { attributeLeadOnCreate } from "@/lib/referrals";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = leadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { clinicName, contactName, email, phone, consent, source, referralCode } = parsed.data;

  const lead = await prisma.lead.create({
    data: {
      clinicName,
      contactName,
      email,
      phone,
      consent,
      consentAt: consent ? new Date() : null,
      source,
      referralCode: referralCode ?? null,
    },
  });

  // p5-1: attribute to a referring intern and accrue a signup commission.
  await attributeLeadOnCreate(lead.id, referralCode);

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
