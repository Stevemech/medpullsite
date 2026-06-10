import { NextResponse } from "next/server";
import { updateLeadStatus } from "@/lib/leads";
import { leadStatusSchema } from "@/lib/validators";

// Auth is enforced by middleware for all /api/admin/* routes.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  const parsed = leadStatusSchema.safeParse(body.status);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }
  try {
    const lead = await updateLeadStatus(id, parsed.data);
    return NextResponse.json({ ok: true, lead: { id: lead.id, status: lead.status } });
  } catch {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }
}
