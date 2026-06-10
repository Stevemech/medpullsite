"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, trackPageview } from "@/lib/analytics";

/**
 * Boots analytics once (no-op when NEXT_PUBLIC_POSTHOG_KEY is unset) and records
 * a pageview on initial load and on every client-side route change.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageview();
  }, [pathname]);

  return null;
}
