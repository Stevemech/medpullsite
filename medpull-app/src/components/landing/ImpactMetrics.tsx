"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Why it matters" band — four facts from a peer-reviewed national study on
 * missed appointments and mortality:
 *   McQueenie R, Ellis DA, McConnachie A, Wilson P, Williamson AE.
 *   "Morbidity, mortality and missed appointments in healthcare: a national
 *   retrospective data linkage study." BMC Medicine 2019;17:2.
 *   https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-018-1234-0
 */
type Metric = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

const METRICS: Metric[] = [
  { to: 8, prefix: "≥", suffix: "×", label: "higher all-cause mortality risk for patients with mental-health conditions who miss appointments" },
  { to: 3.4, decimals: 1, suffix: "×", label: "higher all-cause mortality for patients with long-term physical conditions missing 2+ appointments a year" },
  { to: 824374, label: "patients in the national data-linkage study" },
  { to: 11.5, decimals: 1, suffix: "M", label: "appointments analyzed across 136 practices" },
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
  const counted = useCountUp(m.to, m.decimals ?? 0, run);
  return (
    <div className="text-center">
      <div className="font-heading text-4xl font-semibold tabular-nums text-white sm:text-5xl">
        {m.prefix}
        {counted}
        {m.suffix}
      </div>
      <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-relaxed text-white/70">{m.label}</p>
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
    <section ref={ref} className="bg-brand-800 py-20">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            Why it matters
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-white sm:text-4xl">
            A missed patient isn&apos;t just lost revenue.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/70">
            Keeping patients connected to care is a clinical safety issue. From a national study of
            824,374 patients in Scotland:
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
          {METRICS.map((m) => (
            <MetricItem key={m.label} m={m} run={run} />
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-white/40">
          Source: McQueenie et al.,{" "}
          <a
            href="https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-018-1234-0"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/70"
          >
            “Morbidity, mortality and missed appointments in healthcare,” BMC Medicine 2019
          </a>
          .
        </p>
      </div>
    </section>
  );
}
