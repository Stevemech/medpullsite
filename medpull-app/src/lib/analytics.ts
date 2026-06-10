/**
 * Analytics facade (p1-5). Wraps PostHog and no-ops entirely when
 * NEXT_PUBLIC_POSTHOG_KEY is unset, so the site works with zero config.
 * Safe to call from any client component.
 *
 * Tracked events:
 *   $pageview            — on initial load / route mount
 *   popup_form_viewed    — interest popup opened
 *   popup_form_started   — first field interaction
 *   popup_form_submitted — successful lead submission
 *   intake_*             — pilot intake funnel (p4-3)
 */

let booted = false;

export function analyticsEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

export function initAnalytics() {
  if (typeof window === "undefined" || booted || !analyticsEnabled()) return;
  booted = true;
  import("posthog-js").then(({ default: posthog }) => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: false, // we send pageviews explicitly
      person_profiles: "identified_only",
    });
  });
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!analyticsEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[analytics noop] ${event}`, properties ?? {});
    }
    return;
  }
  import("posthog-js").then(({ default: posthog }) => {
    posthog.capture(event, properties);
  });
}

export function trackPageview() {
  if (typeof window === "undefined") return;
  track("$pageview", { path: window.location.pathname });
}

/**
 * Records a form funnel step both to PostHog (via track) and to the local
 * server-side FormEvent table (p4-6), so the reporting dashboard works even
 * when PostHog is unconfigured. Best-effort and non-blocking.
 */
export function recordFunnel(form: "popup" | "intake", event: "viewed" | "started" | "submitted") {
  if (typeof window === "undefined") return;
  track(`${form}_form_${event}`);
  try {
    const payload = JSON.stringify({ form, event });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // ignore
  }
}
