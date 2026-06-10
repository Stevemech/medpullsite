"use client";

import { useEffect, useState } from "react";
import { EHR_SYSTEMS, SPECIALTIES } from "@/lib/intake-schema";
import { recordFunnel } from "@/lib/analytics";

type Form = Record<string, string | boolean>;

const STEPS = ["Practice", "Systems", "Volume", "Contact"] as const;

const REQUIRED_BY_STEP: Record<number, string[]> = {
  0: ["practiceName", "specialty"],
  1: [],
  2: [],
  3: ["contactName", "contactEmail", "contactPhone", "consent"],
};

const inputClass =
  "mt-1 w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:bg-white";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-600">{hint}</span>}
    </label>
  );
}

export function IntakeForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({ locations: "1", consent: false });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  // Record a "viewed" funnel event once when the form mounts.
  useEffect(() => {
    recordFunnel("intake", "viewed");
  }, []);

  const set = (k: string, v: string | boolean) => {
    if (!started) {
      setStarted(true);
      recordFunnel("intake", "started");
    }
    setForm((f) => ({ ...f, [k]: v }));
  };
  const val = (k: string) => (form[k] ?? "") as string;

  const validateStep = (): boolean => {
    const missing = REQUIRED_BY_STEP[step].filter((k) =>
      k === "consent" ? form[k] !== true : !String(form[k] ?? "").trim()
    );
    if (missing.length) {
      setTopError("Please complete the required fields before continuing.");
      return false;
    }
    setTopError(null);
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setErrors({});
    setTopError(null);
    try {
      const payload = {
        ...form,
        locations: Number(form.locations || 1),
        monthlyVisits: form.monthlyVisits ? Number(form.monthlyVisits) : undefined,
        weeklyCalls: form.weeklyCalls ? Number(form.weeklyCalls) : undefined,
        providers: form.providers ? Number(form.providers) : undefined,
        missedPctEstimate: form.missedPctEstimate ? Number(form.missedPctEstimate) : undefined,
      };
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setDone(true);
        recordFunnel("intake", "submitted");
      } else {
        setErrors(data.fieldErrors ?? {});
        setTopError(data.error || "Something went wrong.");
      }
    } catch {
      setTopError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (n: string) =>
    errors[n]?.[0] ? <p className="mt-1 text-xs text-red-600">{errors[n][0]}</p> : null;

  if (done) {
    return (
      <div className="rounded-2xl border border-cream-200 bg-white p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-4 font-heading text-2xl font-semibold">Thanks — we&apos;ve got it.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
          Our team will review your practice details and reach out within one business day to set
          up your pilot.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-6 sm:p-8">
      {/* progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i <= step ? "bg-brand-600 text-white" : "bg-cream-100 text-ink-600"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs ${i === step ? "font-semibold text-ink-900" : "text-ink-600"}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-cream-200" />}
          </div>
        ))}
      </div>

      {topError && (
        <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{topError}</p>
      )}

      <div className="mt-6 space-y-4">
        {step === 0 && (
          <>
            <Field label="Practice name *">
              <input className={inputClass} value={val("practiceName")} onChange={(e) => set("practiceName", e.target.value)} placeholder="Riverside Pediatrics" />
              {fieldError("practiceName")}
            </Field>
            <Field label="Website">
              <input className={inputClass} value={val("website")} onChange={(e) => set("website", e.target.value)} placeholder="riversidepeds.com" />
            </Field>
            <Field label="Primary specialty *">
              <select className={inputClass} value={val("specialty")} onChange={(e) => set("specialty", e.target.value)}>
                <option value="">Select…</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {fieldError("specialty")}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City"><input className={inputClass} value={val("city")} onChange={(e) => set("city", e.target.value)} /></Field>
              <Field label="State"><input className={inputClass} value={val("state")} onChange={(e) => set("state", e.target.value)} placeholder="CA" /></Field>
            </div>
            <Field label="Number of locations">
              <input type="number" min={1} className={inputClass} value={val("locations")} onChange={(e) => set("locations", e.target.value)} />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="EHR system" hint="Which system do you use for patient records?">
              <select className={inputClass} value={val("ehrSystem")} onChange={(e) => set("ehrSystem", e.target.value)}>
                <option value="">Select…</option>
                {EHR_SYSTEMS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Scheduling system" hint="e.g. the EHR's scheduler, Cal.com, paper">
              <input className={inputClass} value={val("schedulingSystem")} onChange={(e) => set("schedulingSystem", e.target.value)} />
            </Field>
            <Field label="Phone system" hint="e.g. RingCentral, a landline, an answering service">
              <input className={inputClass} value={val("phoneSystem")} onChange={(e) => set("phoneSystem", e.target.value)} />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Monthly patient visits"><input type="number" min={0} className={inputClass} value={val("monthlyVisits")} onChange={(e) => set("monthlyVisits", e.target.value)} /></Field>
              <Field label="Weekly inbound calls"><input type="number" min={0} className={inputClass} value={val("weeklyCalls")} onChange={(e) => set("weeklyCalls", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Number of providers"><input type="number" min={0} className={inputClass} value={val("providers")} onChange={(e) => set("providers", e.target.value)} /></Field>
              <Field label="Est. % calls missed" hint="Your best guess"><input type="number" min={0} max={100} className={inputClass} value={val("missedPctEstimate")} onChange={(e) => set("missedPctEstimate", e.target.value)} /></Field>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Your name *"><input className={inputClass} value={val("contactName")} onChange={(e) => set("contactName", e.target.value)} />{fieldError("contactName")}</Field>
              <Field label="Your role"><input className={inputClass} value={val("contactRole")} onChange={(e) => set("contactRole", e.target.value)} placeholder="Practice Manager" /></Field>
            </div>
            <Field label="Work email *"><input type="email" className={inputClass} value={val("contactEmail")} onChange={(e) => set("contactEmail", e.target.value)} />{fieldError("contactEmail")}</Field>
            <Field label="Phone *"><input type="tel" className={inputClass} value={val("contactPhone")} onChange={(e) => set("contactPhone", e.target.value)} />{fieldError("contactPhone")}</Field>
            <Field label="Best time to reach you"><input className={inputClass} value={val("bestTime")} onChange={(e) => set("bestTime", e.target.value)} placeholder="Weekday mornings" /></Field>
            <Field label="Anything else we should know?">
              <textarea className={`${inputClass} min-h-24`} value={val("notes")} onChange={(e) => set("notes", e.target.value)} />
            </Field>
            <label className="flex items-start gap-3 rounded-xl bg-cream-100 p-3">
              <input type="checkbox" checked={form.consent === true} onChange={(e) => set("consent", e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-600" />
              <span className="text-xs leading-relaxed text-ink-600">
                I consent to MedPull contacting me about a pilot and storing this information.{" "}
                TODO(steve): finalize intake consent + privacy language.
              </span>
            </label>
            {fieldError("consent")}
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="rounded-xl px-4 py-2 text-sm font-medium text-ink-600 transition hover:text-brand-700 disabled:opacity-40"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={next} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            Continue
          </button>
        ) : (
          <button onClick={submit} disabled={submitting} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60">
            {submitting ? "Submitting…" : "Submit intake"}
          </button>
        )}
      </div>
    </div>
  );
}
