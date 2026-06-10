import { NextResponse } from "next/server";
import { INTERN_COOKIE, passwordMatches, sessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const secret = process.env.INTERN_PASSWORD;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "INTERN_PASSWORD is not set on the server." },
      { status: 503 }
    );
  }
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  if (!passwordMatches(secret, body.password ?? "")) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(INTERN_COOKIE, await sessionToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(INTERN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
