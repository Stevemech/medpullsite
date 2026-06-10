"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordFunnel } from "@/lib/analytics";

/**
 * Interest popup (p1-2). Opens after a short delay on first visit, or
 * immediately when any element dispatches `medpull:open-popup` (used by the
 * landing page CTAs). Dismissal/submission is remembered in localStorage so
 * returning visitors aren't nagged.
 */

const STORAGE_KEY = "medpull.popup.dismissedAt";
const RESHOW_AFTER_DAYS = 7;
const AUTO_OPEN_DELAY_MS = 9000;

// TODO(steve): replace with reviewed TCPA consent language (checklist p0-4).
// This is placeholder copy only — do not launch with it.
const CONSENT_PLACEHOLDER =
  "I agree to receive calls and text messages from MedPull about scheduling and product updates at the number provided. Consent is not a condition of purchase. Message and data rates may apply. Reply STOP to opt out.";

export function openLeadPopup() {
  window.dispatchEvent(new CustomEvent("medpull:open-popup"));
}

type FormState = {
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  consent: boolean;
};

const EMPTY: FormState = {
  clinicName: "",
  contactName: "",
  email: "",
  phone: "",
  consent: false,
};

export default function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Dismiss with an exit animation: play the closing animation, then unmount.
  const dismiss = useCallback(() => {
    setClosing(true);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // storage unavailable (private mode) — popup will just reappear next visit
    }
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  }, []);

  // Auto-open once per RESHOW_AFTER_DAYS unless previously dismissed/submitted.
  useEffect(() => {
    let snoozedUntil = 0;
    try {
      const at = Number(localStorage.getItem(STORAGE_KEY) || 0);
      snoozedUntil = at + RESHOW_AFTER_DAYS * 24 * 60 * 60 * 1000;
    } catch {
      // ignore
    }
    if (Date.now() < snoozedUntil) return;
    const t = setTimeout(() => setOpen(true), AUTO_OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // CTAs anywhere on the site can open the popup.
  useEffect(() => {
    const onOpen = () => {
      setDone(false);
      setClosing(false);
      setOpen(true);
    };
    window.addEventListener("medpull:open-popup", onOpen);
    return () => window.removeEventListener("medpull:open-popup", onOpen);
  }, []);

  useEffect(() => {
    if (!open || closing) return;
    recordFunnel("popup", "viewed");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closing, dismiss]);

  if (!open && !closing) return null;

  const set = (field: keyof FormState, value: string | boolean) => {
    if (!startedRef.current) {
      startedRef.current = true;
      recordFunnel("popup", "started");
    }
    setForm((f) => ({ ...f, [field]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setTopError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "popup",
          referralCode: params.get("ref") || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setDone(true);
        recordFunnel("popup", "submitted");
        try {
          localStorage.setItem(STORAGE_KEY, String(Date.now()));
        } catch {
          // ignore
        }
      } else {
        setErrors(data.fieldErrors ?? {});
        setTopError(data.fieldErrors ? null : data.error || "Something went wrong.");
      }
    } catch {
      setTopError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name: string) =>
    errors[name]?.[0] ? (
      <p className="mt-1 text-xs text-red-600">{errors[name][0]}</p>
    ) : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm ${
        closing ? "backdrop-exit" : "backdrop-enter"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-popup-title"
        className={`w-full max-w-md rounded-2xl border border-brand-100 bg-white p-8 shadow-2xl ${
          closing ? "dialog-exit" : "dialog-enter"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="lead-popup-title" className="font-heading text-2xl font-semibold tracking-tight">
            See MedPull in action
          </h2>
          <button
            onClick={dismiss}
            aria-label="Close"
            className="rounded-lg p-1 text-ink-600 transition hover:bg-cream-100 hover:text-ink-900"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {done ? (
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="mt-4 font-medium">Thanks — you&apos;re on the list.</p>
            <p className="mt-1 text-sm text-ink-600">
              Our team will reach out within one business day to set up a quick walkthrough.
            </p>
            <button
              onClick={dismiss}
              className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Tell us a little about your clinic and we&apos;ll show you how MedPull keeps your
              schedule full.
            </p>
            {topError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{topError}</p>
            )}
            <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
              <div>
                <label htmlFor="popup-clinic" className="block text-sm font-medium">
                  Clinic name
                </label>
                <input
                  id="popup-clinic"
                  value={form.clinicName}
                  onChange={(e) => set("clinicName", e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-brand-100 bg-cream-50 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
                  placeholder="Sunrise Family Clinic"
                />
                {fieldError("clinicName")}
              </div>
              <div>
                <label htmlFor="popup-contact" className="block text-sm font-medium">
                  Your name
                </label>
                <input
                  id="popup-contact"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-brand-100 bg-cream-50 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
                  placeholder="Dana Whitfield"
                />
                {fieldError("contactName")}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="popup-email" className="block text-sm font-medium">
                    Work email
                  </label>
                  <input
                    id="popup-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-brand-100 bg-cream-50 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
                    placeholder="you@clinic.com"
                  />
                  {fieldError("email")}
                </div>
                <div>
                  <label htmlFor="popup-phone" className="block text-sm font-medium">
                    Phone
                  </label>
                  <input
                    id="popup-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-brand-100 bg-cream-50 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
                    placeholder="(415) 555-0142"
                  />
                  {fieldError("phone")}
                </div>
              </div>
              <label className="flex items-start gap-3 rounded-xl bg-cream-100 p-3">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-brand-600"
                />
                <span className="text-xs leading-relaxed text-ink-600">{CONSENT_PLACEHOLDER}</span>
              </label>
              {fieldError("consent")}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Request a walkthrough"}
              </button>
              <p className="text-center text-[11px] text-ink-600/70">
                No spam, no obligation. We respond within one business day.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
