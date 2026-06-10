"use client";

/**
 * Cal.com scheduling embed (p2-6). Renders the booking iframe when a URL is
 * provided; otherwise shows a graceful empty state with a CTA to the interest
 * popup so the page is still useful while CAL_COM_URL is unset.
 */
import { openLeadPopup } from "@/components/LeadPopup";

export function CalEmbed({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="rounded-2xl border border-dashed border-cream-200 bg-white p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>
        <h2 className="mt-4 font-heading text-xl font-semibold">Scheduling opens soon</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
          Online booking isn&apos;t connected yet. Leave your details and our team will reach out
          to find a time that works.
        </p>
        <button
          onClick={() => openLeadPopup()}
          className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Request a time
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
      <iframe
        src={url}
        title="Book a meeting with MedPull"
        className="h-[80vh] min-h-[640px] w-full"
        loading="lazy"
      />
    </div>
  );
}
