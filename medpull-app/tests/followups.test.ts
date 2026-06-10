import { describe, expect, it } from "vitest";
import { dueSteps, FOLLOWUP_SEQUENCE } from "@/config/followup-sequence";

const created = new Date("2026-06-01T12:00:00Z");
const hours = (n: number) => new Date(created.getTime() + n * 3600_000);

describe("follow-up due-step selection", () => {
  it("fires the welcome step immediately", () => {
    expect(dueSteps(created, [], created)).toContain("welcome");
  });

  it("does not fire steps before their delay", () => {
    const due = dueSteps(created, ["welcome"], hours(1));
    expect(due).not.toContain("day-1"); // day-1 is at 24h
    expect(due).toHaveLength(0);
  });

  it("fires day-1 after 24h once welcome is done", () => {
    const due = dueSteps(created, ["welcome"], hours(25));
    expect(due[0]).toBe("day-1");
  });

  it("never repeats a completed step", () => {
    const allIds = FOLLOWUP_SEQUENCE.map((s) => s.id);
    const due = dueSteps(created, allIds, hours(1000));
    expect(due).toHaveLength(0);
  });

  it("returns due steps in sequence order", () => {
    const due = dueSteps(created, [], hours(1000));
    expect(due).toEqual(FOLLOWUP_SEQUENCE.map((s) => s.id));
  });
});
