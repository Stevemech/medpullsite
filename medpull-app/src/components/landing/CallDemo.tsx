"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader, CtaButton } from "./primitives";
import { Logo } from "@/components/Brand";

/**
 * Self-playing "watch MedPull take a call" demo. An animated transcript types
 * out turn-by-turn (with typing indicators) the first time it scrolls into
 * view, then ends on a booked-appointment result card. Fully replayable, and
 * renders the whole transcript statically under prefers-reduced-motion.
 *
 * The script is illustrative product copy (no real patient data).
 */
type Turn = { from: "patient" | "ai"; text: string };

const SCRIPT: Turn[] = [
  { from: "patient", text: "Hi, I need to get my daughter in for a check-up this week." },
  { from: "ai", text: "Of course — happy to help. Is Maya an existing patient with us?" },
  { from: "patient", text: "Yes, she is." },
  {
    from: "ai",
    text: "Perfect. Dr. Patel has openings Tuesday at 9:00 AM or Thursday at 2:30 PM. Which works better?",
  },
  { from: "patient", text: "Tuesday morning is great." },
  {
    from: "ai",
    text: "Booked! Maya is set with Dr. Patel, Tuesday at 9:00 AM. I'll text you a confirmation and a reminder the day before. Anything else?",
  },
  { from: "patient", text: "Nope, that's everything — thank you!" },
];

const TYPING_MS = 1100;
const READ_GAP_MS = 650;
const patientGap = (text: string) => Math.min(1600, 700 + text.length * 14);

function Waveform() {
  return (
    <div className="flex items-end gap-[3px]" aria-hidden>
      {[0.2, 0.5, 0.15, 0.7, 0.35, 0.9, 0.25, 0.6, 0.4].map((d, i) => (
        <span
          key={i}
          className="wave-bar h-4 w-[3px] rounded-full bg-white/70"
          style={{ animationDelay: `${d}s` }}
        />
      ))}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50">
        <Logo className="h-5 w-5" />
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-cream-100 px-4 py-3">
        {[0, 0.15, 0.3].map((d) => (
          <span
            key={d}
            className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-600"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function CallDemo() {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const play = useCallback(() => {
    clearTimers();
    setFinished(false);
    setTyping(false);
    setShown(0);

    if (reduced) {
      setShown(SCRIPT.length);
      setFinished(true);
      return;
    }

    let t = 400;
    SCRIPT.forEach((turn, i) => {
      if (turn.from === "ai") {
        timers.current.push(setTimeout(() => setTyping(true), t));
        t += TYPING_MS;
        timers.current.push(
          setTimeout(() => {
            setTyping(false);
            setShown(i + 1);
          }, t)
        );
        t += READ_GAP_MS;
      } else {
        timers.current.push(setTimeout(() => setShown(i + 1), t));
        t += patientGap(turn.text);
      }
    });
    timers.current.push(setTimeout(() => setFinished(true), t + 300));
  }, [reduced]);

  // Auto-start once when scrolled into view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !started) {
          setStarted(true);
          play();
          obs.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started, play]);

  useEffect(() => () => clearTimers(), []);

  // Keep the transcript scrolled to the latest bubble.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [shown, typing]);

  return (
    <section id="demo" ref={sectionRef} className="bg-cream-100 py-24">
      <div className="mx-auto max-w-[1100px] px-6">
        <SectionHeader
          align="center"
          eyebrow="Live demo"
          title="Watch MedPull"
          highlight="take a call."
          lede="A real booking flow, handled end-to-end in seconds — no hold music, no missed message."
        />

        <div className="mx-auto mt-10 max-w-xl overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-xl">
          {/* call header */}
          <div className="flex items-center justify-between bg-brand-700 px-5 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="live-pulse absolute inline-flex h-2.5 w-2.5 rounded-full bg-success-500" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success-500" />
              </span>
              <span className="text-sm font-medium">Incoming call · New patient</span>
            </div>
            <Waveform />
          </div>

          {/* transcript */}
          <div ref={scrollRef} className="h-80 space-y-4 overflow-y-auto px-5 py-6">
            {SCRIPT.slice(0, shown).map((turn, i) =>
              turn.from === "ai" ? (
                <div key={i} className="bubble-in flex items-end justify-end gap-2">
                  <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2.5 text-sm leading-relaxed text-white">
                    {turn.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="bubble-in flex items-end gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-200 text-[10px] font-bold text-ink-600">
                    PT
                  </span>
                  <div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-cream-100 px-4 py-2.5 text-sm leading-relaxed text-ink-900">
                    {turn.text}
                  </div>
                </div>
              )
            )}
            {typing && <TypingBubble />}

            {finished && (
              <div className="bubble-in rounded-xl border border-success-500/30 bg-success-500/10 p-4">
                <div className="flex items-center gap-2 text-success-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="text-sm font-semibold">Appointment booked</span>
                </div>
                <p className="mt-1 text-sm text-ink-700">
                  Maya · Dr. Patel · Tue 9:00 AM — confirmation texted, reminder scheduled.
                </p>
              </div>
            )}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between border-t border-cream-200 px-5 py-3">
            <span className="text-xs text-ink-600">
              {finished ? "Call complete · 0 staff touches" : "MedPull is handling the call…"}
            </span>
            <button
              onClick={play}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-cream-100"
            >
              ↻ Replay
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <CtaButton source="call-demo" className="px-6 py-3 text-base">
            See it on your phone lines
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
