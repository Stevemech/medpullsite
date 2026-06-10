import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Analytics must be a complete no-op when NEXT_PUBLIC_POSTHOG_KEY is unset:
 * no throws, no posthog import, safe to call from anywhere.
 */
describe("analytics facade", () => {
  const original = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = original;
  });

  it("reports disabled and no-ops when key is unset", async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const mod = await import("@/lib/analytics");
    expect(mod.analyticsEnabled()).toBe(false);
    // None of these should throw with no window and no key.
    expect(() => mod.track("popup_form_viewed")).not.toThrow();
    expect(() => mod.track("popup_form_started")).not.toThrow();
    expect(() => mod.track("popup_form_submitted")).not.toThrow();
    expect(() => mod.trackPageview()).not.toThrow();
    expect(() => mod.initAnalytics()).not.toThrow();
  });

  it("reports enabled when key is present", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
    const mod = await import("@/lib/analytics");
    expect(mod.analyticsEnabled()).toBe(true);
  });
});
