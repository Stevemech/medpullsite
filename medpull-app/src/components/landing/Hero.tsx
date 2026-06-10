"use client";

import { CtaButton } from "./primitives";
import { Logo } from "@/components/Brand";
import { HeroAurora } from "./HeroAurora";

const TRUST = [
  { label: "Built for HIPAA workflows" },
  { label: "Works with your phone number" },
  { label: "Live in under two weeks" },
];

function MockDashboard() {
  return (
    <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-cream-200 bg-white p-3 shadow-2xl">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_1fr]">
        {/* sidebar */}
        <aside className="hidden rounded-xl bg-brand-50/60 p-4 md:block">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="text-sm font-semibold">Front Desk</span>
          </div>
          <nav className="mt-5 space-y-1 text-sm">
            <div className="rounded-lg bg-brand-600 px-3 py-2 font-medium text-white">Today</div>
            <div className="px-3 py-2 text-ink-600">Call queue</div>
            <div className="px-3 py-2 text-ink-600">Schedule</div>
            <div className="px-3 py-2 text-ink-600">Messages</div>
            <div className="px-3 py-2 text-ink-600">Patients</div>
          </nav>
        </aside>
        {/* main */}
        <div className="rounded-xl bg-cream-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-600">Good morning, Riverside Pediatrics</p>
              <p className="font-heading text-lg font-semibold">Tuesday at a glance</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-success-500" /> Answering live
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { k: "Calls answered", v: "34", d: "+12" },
              { k: "Appointments booked", v: "19", d: "+6" },
              { k: "After-hours saved", v: "11", d: "+11" },
              { k: "Avg. pickup", v: "0.8s", d: "" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-cream-200 bg-white p-3">
                <p className="text-[11px] text-ink-600">{s.k}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{s.v}</p>
                {s.d && <p className="text-[11px] font-medium text-success-500">{s.d} today</p>}
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-cream-200 bg-white p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600">
              Live schedule
            </p>
            <ul className="space-y-2 text-sm">
              {[
                { t: "9:00", c: "bg-brand-500", n: "New patient · well visit" },
                { t: "9:30", c: "bg-accent-500", n: "Callback · insurance question" },
                { t: "10:15", c: "bg-brand-400", n: "Follow-up · lab results" },
              ].map((r) => (
                <li key={r.t} className="flex items-center gap-3">
                  <span className="w-10 text-xs tabular-nums text-ink-600">{r.t}</span>
                  <span className={`h-8 w-1.5 rounded ${r.c}`} />
                  <span className="text-ink-900">{r.n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-20">
      <HeroAurora />
      <div className="mx-auto max-w-3xl text-center fade-up">
        <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl md:text-6xl">
          Your front desk, <span className="text-brand-600">never on hold.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-600">
          MedPull answers every patient call, books the appointment, and follows up by text —
          so your team stops chasing voicemails and your schedule stays full. Purpose-built for
          independent clinics.
        </p>
        <div className="mt-8 flex justify-center">
          <CtaButton source="hero" className="px-6 py-3 text-base">
            Request a demo
          </CtaButton>
        </div>
        <p className="mt-4 text-sm text-ink-600/80">
          No new phone system. No long contract. Cancel anytime during the pilot.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-2 text-xs text-ink-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-600">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <MockDashboard />
    </section>
  );
}
