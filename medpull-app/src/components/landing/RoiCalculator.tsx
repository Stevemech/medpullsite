"use client";

import { useMemo, useState } from "react";
import { SectionHeader, CtaButton } from "./primitives";

/**
 * Illustrative ROI estimate. All coefficients are placeholders.
 * TODO(steve): replace assumptions with validated figures before publishing.
 */
function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  prefix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-ink-700">{label}</label>
        <span className="text-sm font-semibold tabular-nums text-brand-700">
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-brand-600"
      />
    </div>
  );
}

export function RoiCalculator() {
  const [callsPerDay, setCallsPerDay] = useState(60);
  const [missedPct, setMissedPct] = useState(25);
  const [bookingValue, setBookingValue] = useState(180);
  const [convertPct, setConvertPct] = useState(45);

  const { recoveredPerMonth, revenuePerMonth } = useMemo(() => {
    const workdays = 22;
    const missedPerMonth = callsPerDay * workdays * (missedPct / 100);
    const recovered = missedPerMonth * (convertPct / 100);
    return {
      recoveredPerMonth: Math.round(recovered),
      revenuePerMonth: Math.round(recovered * bookingValue),
    };
  }, [callsPerDay, missedPct, bookingValue, convertPct]);

  return (
    <section id="roi" className="py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader
          eyebrow="ROI"
          title="What does a missed call"
          highlight="actually cost you?"
          lede="Drag the sliders to your clinic's reality. This is a rough, illustrative estimate — not a quote."
        />
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6 rounded-2xl border border-cream-200 bg-white p-6">
            <Slider label="Inbound calls per day" value={callsPerDay} min={10} max={300} step={5} onChange={setCallsPerDay} />
            <Slider label="Share missed at peak" value={missedPct} min={5} max={60} step={1} suffix="%" onChange={setMissedPct} />
            <Slider label="Value of a booked visit" value={bookingValue} min={40} max={600} step={10} prefix="$" onChange={setBookingValue} />
            <Slider label="Of recovered calls that book" value={convertPct} min={10} max={80} step={1} suffix="%" onChange={setConvertPct} />
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-cream-100 p-8">
            <div>
              <p className="text-sm text-ink-600">Calls recovered each month</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums text-brand-700">
                {recoveredPerMonth.toLocaleString()}
              </p>
              <div className="my-6 h-px bg-cream-200" />
              <p className="text-sm text-ink-600">Estimated monthly revenue recovered</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums text-brand-700">
                ${revenuePerMonth.toLocaleString()}
              </p>
            </div>
            <div className="mt-8">
              <CtaButton source="roi" className="w-full py-3 text-base">
                See it on your numbers
              </CtaButton>
              <p className="mt-3 text-center text-xs text-ink-600/70">
                TODO(steve): calibrate the model assumptions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
