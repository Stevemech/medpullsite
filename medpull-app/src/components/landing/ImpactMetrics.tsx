"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Impact metrics that count up the first time they scroll into view.
 * NOTE: figures are illustrative. TODO(steve): replace with real, cited numbers.
 */
type Metric = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  static?: string; // render verbatim instead of counting (e.g. "24/7")
};

const METRICS: Metric[] = [
  { to: 12000, suffix: "+", label: "Patient calls answered" },
  { to: 31, suffix: "%", label: "More appointments booked" },
  { to: 0.8, decimals: 1, suffix: "s", label: "Average time to answer" },
  { to: 0, static: "24/7", label: "Always on, never on hold" },
];

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function useCountUp(target: number, decimals: number, run: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setVal(target * easeOut(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);
  return decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
}

function MetricItem({ m, run }: { m: Metric; run: boolean }) {
  const counted = useCountUp(m.to, m.decimals ?? 0, run && !m.static);
  return (
    <div className="text-center">
      <div className="font-heading text-4xl font-semibold tabular-nums text-white sm:text-5xl">
        {m.static ? (
          m.static
        ) : (
          <>
            {m.prefix}
            {counted}
            {m.suffix}
          </>
        )}
      </div>
      <p className="mt-2 text-sm text-white/70">{m.label}</p>
    </div>
  );
}

export function ImpactMetrics() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRun(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-brand-800 py-16">
      <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {METRICS.map((m) => (
          <MetricItem key={m.label} m={m} run={run} />
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-white/40">
        Illustrative figures — TODO(steve): replace with your real, cited metrics.
      </p>
    </section>
  );
}
