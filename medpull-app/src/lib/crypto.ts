/**
 * Field-level encryption for sensitive data at rest (p4-4).
 *
 * AES-256-GCM with a key supplied via INTAKE_ENCRYPTION_KEY (32 bytes, base64).
 * Each value is encrypted with a fresh random IV; the stored string is
 * `v1:<iv-b64>:<ciphertext+tag-b64>`. Without the key, encryption throws (so we
 * never silently store plaintext) — generate one with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const VERSION = "v1";
const ALGO = "aes-256-gcm";
const IV_LEN = 12;

function getKey(): Buffer {
  const raw = process.env.INTAKE_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "INTAKE_ENCRYPTION_KEY is not set — refusing to store sensitive intake data unencrypted."
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      `INTAKE_ENCRYPTION_KEY must decode to 32 bytes (got ${key.length}). Generate a new one.`
    );
  }
  return key;
}

export function isEncryptionConfigured(): boolean {
  try {
    getKey();
    return true;
  } catch {
    return false;
  }
}

export function encryptField(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${iv.toString("base64")}:${Buffer.concat([ct, tag]).toString("base64")}`;
}

export function decryptField(stored: string): string {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== VERSION) {
    throw new Error("Unrecognized ciphertext format");
  }
  const key = getKey();
  const iv = Buffer.from(parts[1], "base64");
  const blob = Buffer.from(parts[2], "base64");
  const tag = blob.subarray(blob.length - 16);
  const ct = blob.subarray(0, blob.length - 16);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/** Encrypt a value if present; pass through undefined/empty. */
export function encryptOptional(value: string | undefined | null): string | null {
  if (value === undefined || value === null || value === "") return null;
  return encryptField(value);
}

/** Decrypt a value if present; returns "" for null, and "[decrypt error]" on failure. */
export function decryptOptional(stored: string | null | undefined): string {
  if (!stored) return "";
  try {
    return decryptField(stored);
  } catch {
    return "[decrypt error]";
  }
}
