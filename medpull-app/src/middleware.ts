import { NextResponse, type NextRequest } from "next/server";
import { REALM_COOKIE, realmSecret, verifyToken, type Realm } from "@/lib/auth";

/**
 * Gate the admin and intern areas. Page requests redirect to the realm's login;
 * API requests get a 401 JSON. Login endpoints themselves are always allowed.
 */
function realmFor(pathname: string): Realm | null {
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) return "admin";
  if (pathname.startsWith("/intern") || pathname.startsWith("/api/intern")) return "intern";
  return null;
}

function isPublic(pathname: string): boolean {
  return (
    pathname === "/admin/login" ||
    pathname === "/intern/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/intern/login"
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const realm = realmFor(pathname);
  if (!realm || isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(REALM_COOKIE[realm])?.value;
  const ok = await verifyToken(realmSecret(realm), token);
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = `/${realm}/login`;
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/intern/:path*", "/api/admin/:path*", "/api/intern/:path*"],
};
