"use client";

import { useState } from "react";

/** Shows the intern's shareable referral URL with a copy button. */
export function ReferralLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${encodeURIComponent(code)}`
      : `/?ref=${code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="mt-4 flex items-center gap-2">
      <code className="flex-1 truncate rounded-lg bg-cream-100 px-3 py-2 text-xs text-ink-600">
        {url}
      </code>
      <button
        onClick={copy}
        className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
