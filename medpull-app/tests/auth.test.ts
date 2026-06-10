import { describe, expect, it } from "vitest";
import { passwordMatches, sessionToken, verifyToken } from "@/lib/auth";

describe("auth", () => {
  it("passwordMatches is exact", () => {
    expect(passwordMatches("secret", "secret")).toBe(true);
    expect(passwordMatches("secret", "Secret")).toBe(false);
    expect(passwordMatches("secret", "secre")).toBe(false);
    expect(passwordMatches(undefined, "secret")).toBe(false);
    expect(passwordMatches("", "")).toBe(false); // empty secret never authenticates
  });

  it("sessionToken is deterministic and non-trivial", async () => {
    const a = await sessionToken("hunter2");
    const b = await sessionToken("hunter2");
    const c = await sessionToken("different");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("verifyToken accepts the matching token only", async () => {
    const token = await sessionToken("pw");
    expect(await verifyToken("pw", token)).toBe(true);
    expect(await verifyToken("pw", token + "0")).toBe(false);
    expect(await verifyToken("wrong", token)).toBe(false);
    expect(await verifyToken(undefined, token)).toBe(false);
    expect(await verifyToken("pw", undefined)).toBe(false);
  });
});
