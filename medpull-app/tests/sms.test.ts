import { describe, expect, it } from "vitest";
import { resolveSendMode } from "@/lib/sms";

describe("SMS send-mode resolution (DRY_RUN default-on)", () => {
  it("dry-runs by default when the flag is unset", () => {
    expect(resolveSendMode(undefined, true)).toBe("dry_run");
    expect(resolveSendMode(undefined, false)).toBe("dry_run");
  });

  it("dry-runs when the flag is anything but the exact string 'false'", () => {
    expect(resolveSendMode("true", true)).toBe("dry_run");
    expect(resolveSendMode("1", true)).toBe("dry_run");
    expect(resolveSendMode("", true)).toBe("dry_run");
  });

  it("goes live only when flag is 'false' AND credentials exist", () => {
    expect(resolveSendMode("false", true)).toBe("live");
  });

  it("stays in dry-run when live is requested but credentials are missing", () => {
    expect(resolveSendMode("false", false)).toBe("dry_run");
  });
});
