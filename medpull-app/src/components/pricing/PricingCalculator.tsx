"use client";

import { useMemo, useState } from "react";
import { PRICING_TIERS, recommendTier, estimatePrice } from "@/config/pricing-tiers";
import { openLeadPopup } from "@/components/LeadPopup";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export function PricingCalculator() {
  const [monthlyCalls, setMonthlyCalls] = useState(900);
  const [locations, setLocations] = useState(1);

  const { recommended, estimate } = useMemo(() => {
    const input = { monthlyCalls, locations };
    const tier = recommendTier(input);
    return { recommended: tier, estimate: estimatePrice(tier, input) };
  }, [monthlyCalls, locations]);

  return (
    <div className="grid grid-cols-1 gap-8 rounded-2xl border border-cream-200 bg-white p-6 md:grid-cols-2 md:p-8">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Inbound calls per month</label>
            <span className="text-sm font-semibold tabular-nums text-brand-700">
              {monthlyCalls.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={6000}
            step={100}
            value={monthlyCalls}
            onChange={(e) => setMonthlyCalls(Number(e.target.value))}
            className="mt-2 w-full accent-brand-600"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Locations</label>
            <span className="text-sm font-semibold tabular-nums text-brand-700">{locations}</span>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={locations}
            onChange={(e) => setLocations(Number(e.target.value))}
            className="mt-2 w-full accent-brand-600"
          />
        </div>
        <p className="text-xs text-ink-600/70">
          Indicative estimate — your exact quote depends on call volume and locations.
        </p>
      </div>

      <div className="flex flex-col justify-between rounded-2xl bg-cream-100 p-6">
        <div>
          <p className="text-sm text-ink-600">Recommended plan</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-brand-700">
            {recommended.name}
          </p>
          <dl className="mt-4 space-y-1.5 text-sm">
            <Row label="Base" value={money(estimate.base)} />
            {estimate.callOverage > 0 && <Row label="Call overage" value={money(estimate.callOverage)} />}
            {estimate.locationOverage > 0 && (
              <Row label="Extra locations" value={money(estimate.locationOverage)} />
            )}
            <div className="my-2 h-px bg-cream-200" />
            <Row label="Est. monthly" value={money(estimate.estimatedMonthly)} strong />
          </dl>
        </div>
        <button
          onClick={() => openLeadPopup()}
          className="mt-6 w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Get an exact quote
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-600">{label}</dt>
      <dd className={`tabular-nums ${strong ? "text-lg font-semibold text-brand-700" : "font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}

export function TierCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {PRICING_TIERS.map((t, i) => (
        <div
          key={t.id}
          className={`rounded-2xl border bg-white p-6 ${
            i === 1 ? "border-brand-400 shadow-md" : "border-cream-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold">{t.name}</h3>
            {i === 1 && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                Most popular
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-ink-600">{t.blurb}</p>
          <p className="mt-4">
            <span className="text-sm text-ink-600">from </span>
            <span className="text-3xl font-semibold tabular-nums">${t.monthlyBase}</span>
            <span className="text-sm text-ink-600">/mo</span>
          </p>
          <p className="mt-1 text-xs text-ink-600">
            Includes {t.includedCalls.toLocaleString()} calls ·{" "}
            {t.includedLocations} location{t.includedLocations > 1 ? "s" : ""}
          </p>
          <ul className="mt-4 space-y-2">
            {t.features.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-ink-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-brand-600">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
