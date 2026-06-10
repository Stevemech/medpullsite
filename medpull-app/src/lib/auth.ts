/**
 * Minimal password-gate auth shared by the admin (p2-1) and intern (p5-2)
 * dashboards. A correct password mints a deterministic session token (SHA-256
 * of the secret) stored in an httpOnly cookie; middleware and route handlers
 * verify the cookie by recomputing the token. Uses Web Crypto so the exact same
 * code runs in both the Edge middleware and Node route handlers.
 *
 * This is intentionally simple shared-password auth suitable for an internal
 * tool. It is NOT multi-user auth — every admin shares ADMIN_PASSWORD.
 */

export const ADMIN_COOKIE = "medpull_admin";
export const INTERN_COOKIE = "medpull_intern";

export type Realm = "admin" | "intern";

export const REALM_COOKIE: Record<Realm, string> = {
  admin: ADMIN_COOKIE,
  intern: INTERN_COOKIE,
};

export function realmSecret(realm: Realm): string | undefined {
  return realm === "admin" ? process.env.ADMIN_PASSWORD : process.env.INTERN_PASSWORD;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Deterministic, non-reversible session token derived from the secret. */
export async function sessionToken(secret: string): Promise<string> {
  const bytes = new TextEncoder().encode(`medpull::session::v1::${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(digest);
}

/** Constant-time-ish comparison of two equal-length hex strings. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True when the cookie token matches the secret. Empty/unset secret => false. */
export async function verifyToken(
  secret: string | undefined,
  token: string | undefined
): Promise<boolean> {
  if (!secret || !token) return false;
  const expected = await sessionToken(secret);
  return safeEqual(expected, token);
}

/** True when the submitted password equals the realm secret (login check). */
export function passwordMatches(secret: string | undefined, password: string): boolean {
  if (!secret) return false;
  if (secret.length !== password.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) diff |= secret.charCodeAt(i) ^ password.charCodeAt(i);
  return diff === 0;
}
