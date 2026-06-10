"use client";

import { useState } from "react";
import { SectionHeader, CtaButton } from "./primitives";
import { BrandLockup } from "@/components/Brand";

const CONTAINER = "mx-auto max-w-[1200px] px-6";

export function LogoMarquee() {
  // Placeholder "clients" — clearly generic clinic archetypes, not real names.
  const names = [
    "Riverside Pediatrics",
    "Cascade Family Health",
    "Harbor Dental Group",
    "Sunnyside Dermatology",
    "Meadowbrook OB/GYN",
    "Oakline Orthopedics",
    "Brightpath Primary Care",
    "Lakeview ENT",
  ];
  const row = [...names, ...names];
  return (
    <section className="border-y border-cream-200 bg-cream-50 py-12">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">
        Designed for the clinics that hold communities together
      </p>
      <div
        className="relative mt-8 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee gap-10">
          {row.map((n, i) => (
            <div key={i} className="flex items-center gap-2 whitespace-nowrap">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-200 text-xs font-bold text-brand-700">
                {n
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="text-sm font-medium text-ink-600">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProblemStats() {
  const stats = [
    { v: "42%", c: "of incoming calls to medical practices go unanswered during business hours" },
    { v: "85%", c: "of patients won't call back after a single unanswered attempt" },
    { v: "4×", c: "more likely to switch providers after repeated poor phone experiences" },
    { v: "After hours", c: "is when many patients actually try to book — and reach voicemail" },
  ];
  return (
    <section className="py-24">
      <div className={`${CONTAINER} grid grid-cols-1 gap-12 md:grid-cols-2`}>
        <div>
          <SectionHeader
            eyebrow="The problem"
            title="Every missed call is a patient"
            highlight="walking to a competitor."
            lede="Independent clinics live and die by the phone, but the front desk can only hold one conversation at a time. The overflow doesn't disappear — it turns into voicemails nobody returns, empty slots, and patients who book somewhere that picked up."
          />
          <p className="mt-6 text-xs leading-relaxed text-ink-600/70">
            Sources: analysis of 7,000 calls across 22 medical practices via{" "}
            <a
              href="https://answernet.com/costs-of-missed-calls-in-medical-offices-and-how-to-avoid-them/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink-600"
            >
              AnswerNet
            </a>{" "}
            and{" "}
            <a
              href="https://agentzap.ai/blog/medical-practice-phone-statistics"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink-600"
            >
              industry phone-access data
            </a>
            .
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.map((s) => (
            <div
              key={s.c}
              className="rounded-2xl border border-cream-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-3xl font-semibold tracking-tight text-ink-900">{s.v}</p>
              <div className="mt-3 h-1 w-12 rounded bg-brand-500" />
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{s.c}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    t: "Answers every call, day or night",
    d: "MedPull picks up on the first ring — in English or Spanish — handles scheduling, prescription refill requests, directions, and hours, and escalates anything clinical to your team with a clean summary.",
  },
  {
    t: "Books directly into your calendar",
    d: "New patients and follow-ups land in the right slot with the right provider, using your real availability rules. No double-bookings, no callback queue.",
  },
  {
    t: "Follows up by text automatically",
    d: "Missed a call? MedPull texts back in seconds. Confirmations, reminders, and gentle nudges go out on a schedule you control, all within quiet-hours rules.",
  },
  {
    t: "Captures the lead even when you're closed",
    d: "An interest form and after-hours assistant turn your website and voicemail into a 24/7 intake desk that never forgets to write the patient down.",
  },
  {
    t: "Hands your team a clean handoff",
    d: "Every interaction becomes a short, structured note your staff can act on in seconds — who called, what they needed, and what's next.",
  },
  {
    t: "Respects consent and compliance",
    d: "TCPA-aware messaging, opt-out handling, quiet hours, and audit logging are built in from the first message, not bolted on later.",
  },
];

export function Features() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section id="platform" className="py-24">
      <div className={`${CONTAINER} max-w-3xl`}>
        <SectionHeader
          eyebrow="Platform"
          title="One assistant that runs the whole"
          highlight="front of house."
          lede="MedPull isn't a chatbot bolted to your site. It's an end-to-end front desk that answers, schedules, messages, and documents — so your staff can focus on the patients in the room."
        />
        <div className="mt-10 divide-y divide-cream-200 border-y border-cream-200">
          {FEATURES.map((f, i) => {
            const active = openIdx === i;
            return (
              <div key={f.t}>
                <button
                  onClick={() => setOpenIdx(active ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span
                    className={`text-lg font-medium transition ${
                      active ? "text-ink-900" : "text-ink-600"
                    }`}
                  >
                    {f.t}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`shrink-0 text-brand-600 transition ${active ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div
                  className="grid transition-all duration-300"
                  style={{ gridTemplateRows: active ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-sm leading-relaxed text-ink-600">{f.d}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    t: "Point your overflow to MedPull",
    d: "Forward calls when your line is busy or after hours. Keep your number; nothing changes for patients.",
  },
  {
    n: "02",
    t: "We learn your clinic",
    d: "Hours, providers, services, scheduling rules, and FAQs — configured with you in a single onboarding week.",
  },
  {
    n: "03",
    t: "Watch the schedule fill",
    d: "MedPull answers, books, and follows up. Your team gets clean handoffs and a dashboard of everything that happened.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-cream-100 py-24">
      <div className={CONTAINER}>
        <SectionHeader
          align="center"
          eyebrow="How it works"
          title="Live in a week,"
          highlight="not a quarter."
        />
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white shadow-lg">
                {s.n}
              </div>
              <h3 className="mt-5 text-xl font-semibold">{s.t}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-600">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Do we have to change our phone system or number?",
    a: "No. You forward overflow or after-hours calls to MedPull and keep your existing number and carrier. Patients never see a difference.",
  },
  {
    q: "Is MedPull HIPAA-compliant?",
    a: "MedPull is built around HIPAA workflows — encryption in transit and at rest, access controls, and audit logging. A signed BAA is part of onboarding before any protected information flows through the system.",
  },
  {
    q: "What happens to clinical questions?",
    a: "MedPull handles scheduling and logistics and routes anything clinical to your staff with a concise summary. It never gives medical advice.",
  },
  {
    q: "How long does setup take?",
    a: "Most clinics are live within two weeks. Onboarding is a single configuration week where we encode your hours, providers, and scheduling rules.",
  },
  {
    q: "Does it text patients without consent?",
    a: "Never. Messaging follows TCPA-style consent, honors STOP opt-outs instantly, and respects quiet hours (no messages 9pm–8am in the patient's local time by default).",
  },
  {
    q: "Which scheduling and EHR systems do you support?",
    a: "We're building toward Epic and athenahealth integrations and support calendar-based scheduling today. See the integration roadmap for details.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-24">
      <div className={CONTAINER}>
        <SectionHeader align="center" eyebrow="FAQ" title="Questions clinics" highlight="ask us first." />
        <div className="mx-auto mt-10 max-w-[700px] divide-y divide-cream-200 border-y border-cream-200">
          {FAQS.map((f, i) => {
            const active = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(active ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-medium">{f.q}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`shrink-0 text-brand-600 transition ${active ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div
                  className="grid transition-all duration-300"
                  style={{ gridTemplateRows: active ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-sm leading-relaxed text-ink-600">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="bg-brand-800 px-6 py-24 text-center">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Stop losing patients to a busy signal.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/75">
          Join the pilot and see what a front desk that never goes on hold does for your schedule.
        </p>
        <div className="mt-8 flex justify-center">
          <CtaButton variant="inverted" source="final-cta" className="px-6 py-3 text-base">
            Request a demo
          </CtaButton>
        </div>
        <p className="mt-4 text-sm text-white/60">
          We respond within one business day. No obligation.
        </p>
      </div>
    </section>
  );
}

export function Footer() {
  const cols = [
    {
      h: "Product",
      links: [
        { label: "How it works", href: "#how" },
        { label: "Platform", href: "#platform" },
        { label: "Book a demo", href: "/book" },
        { label: "Integrations", href: "/ehr-roadmap" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    {
      h: "Company",
      links: [
        { label: "Pilot program", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Careers", href: "#" },
      ],
    },
    {
      h: "Legal",
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "HIPAA", href: "#" },
      ],
    },
  ];
  return (
    <footer className="bg-brand-900 px-6 pb-8 pt-16 text-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 md:grid-cols-5">
        <div className="col-span-2">
          <BrandLockup light />
          <p className="mt-3 max-w-xs text-sm text-white/50">
            The AI front desk for independent clinics. Answer every call, fill every slot.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="text-sm font-semibold text-white/70">{c.h}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-white/40 transition hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-[1200px] flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/30 sm:flex-row">
        <span>© 2026 MedPull. All rights reserved.</span>
        <span>The AI front desk for independent clinics.</span>
      </div>
    </footer>
  );
}
