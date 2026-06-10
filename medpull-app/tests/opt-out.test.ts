import { describe, expect, it } from "vitest";
import { parseInboundKeyword } from "@/lib/opt-out";

describe("inbound keyword parsing", () => {
  it("recognizes STOP variants case-insensitively", () => {
    for (const w of ["STOP", "stop", " Stop ", "STOP.", "unsubscribe", "Cancel", "QUIT", "end"]) {
      expect(parseInboundKeyword(w)).toBe("stop");
    }
  });

  it("recognizes START variants", () => {
    for (const w of ["START", "start", "Unstop", "YES"]) {
      expect(parseInboundKeyword(w)).toBe("start");
    }
  });

  it("matches STOP as the first token even with trailing words (carrier convention)", () => {
    expect(parseInboundKeyword("STOP please")).toBe("stop");
  });

  it("returns null for ordinary messages", () => {
    expect(parseInboundKeyword("What are your hours?")).toBeNull();
    expect(parseInboundKeyword("")).toBeNull();
    expect(parseInboundKeyword("can you stop calling")).toBeNull(); // 'stop' not first token
  });
});
