import { beforeAll, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";

// Provide a valid 32-byte key before importing the module under test.
beforeAll(() => {
  process.env.INTAKE_ENCRYPTION_KEY = randomBytes(32).toString("base64");
});

describe("field-level encryption", () => {
  it("round-trips a value", async () => {
    const { encryptField, decryptField } = await import("@/lib/crypto");
    const plain = "jordan@clinic.example";
    const ct = encryptField(plain);
    expect(ct).toMatch(/^v1:/);
    expect(ct).not.toContain(plain);
    expect(decryptField(ct)).toBe(plain);
  });

  it("produces distinct ciphertexts for the same plaintext (random IV)", async () => {
    const { encryptField } = await import("@/lib/crypto");
    expect(encryptField("same")).not.toBe(encryptField("same"));
  });

  it("rejects tampered ciphertext (GCM auth tag)", async () => {
    const { encryptField, decryptField } = await import("@/lib/crypto");
    const ct = encryptField("secret");
    const parts = ct.split(":");
    const blob = Buffer.from(parts[2], "base64");
    blob[0] ^= 0xff; // flip a byte
    const tampered = `${parts[0]}:${parts[1]}:${blob.toString("base64")}`;
    expect(() => decryptField(tampered)).toThrow();
  });

  it("encryptOptional/decryptOptional handle empties", async () => {
    const { encryptOptional, decryptOptional } = await import("@/lib/crypto");
    expect(encryptOptional("")).toBeNull();
    expect(encryptOptional(undefined)).toBeNull();
    expect(decryptOptional(null)).toBe("");
    const ct = encryptOptional("x");
    expect(decryptOptional(ct)).toBe("x");
  });

  it("throws when the key is missing", async () => {
    const saved = process.env.INTAKE_ENCRYPTION_KEY;
    delete process.env.INTAKE_ENCRYPTION_KEY;
    const { encryptField, isEncryptionConfigured } = await import("@/lib/crypto");
    expect(isEncryptionConfigured()).toBe(false);
    expect(() => encryptField("x")).toThrow();
    process.env.INTAKE_ENCRYPTION_KEY = saved;
  });
});
