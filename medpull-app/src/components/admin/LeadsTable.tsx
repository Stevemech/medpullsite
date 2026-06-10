"use client";

import { useState } from "react";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/validators";

export type LeadRow = {
  id: string;
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  consent: boolean;
  source: string;
  status: string;
  score?: number;
  scoreTier?: string;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-brand-500/15 text-brand-700",
  contacted: "bg-accent-500/15 text-accent-500",
  scheduled: "bg-blue-500/15 text-blue-700",
  closed: "bg-cream-200 text-ink-600",
};

const TIER_STYLES: Record<string, string> = {
  hot: "text-red-600",
  warm: "text-accent-500",
  cool: "text-brand-600",
  cold: "text-ink-600",
};

export function LeadsTable({ initialLeads }: { initialLeads: LeadRow[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [savingId, setSavingId] = useState<string | null>(null);

  const setStatus = async (id: string, status: LeadStatus) => {
    setSavingId(id);
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) setLeads(prev); // revert on failure
    } catch {
      setLeads(prev);
    } finally {
      setSavingId(null);
    }
  };

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cream-200 bg-white p-12 text-center text-ink-600">
        No leads match your filters yet.
      </div>
    );
  }

  const hasScores = leads.some((l) => typeof l.score === "number");

  return (
    <div className="overflow-x-auto rounded-2xl border border-cream-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cream-200 text-left text-xs uppercase tracking-wide text-ink-600">
            <th className="px-4 py-3 font-semibold">Clinic / Contact</th>
            <th className="px-4 py-3 font-semibold">Contact info</th>
            {hasScores && <th className="px-4 py-3 font-semibold">Score</th>}
            <th className="px-4 py-3 font-semibold">Source</th>
            <th className="px-4 py-3 font-semibold">Received</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50/60">
              <td className="px-4 py-3">
                <div className="font-medium text-ink-900">{l.clinicName}</div>
                <div className="text-ink-600">{l.contactName}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-ink-900">{l.email}</div>
                <div className="text-ink-600">{l.phone}</div>
                {!l.consent && (
                  <span className="mt-1 inline-block rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                    NO CONSENT
                  </span>
                )}
              </td>
              {hasScores && (
                <td className="px-4 py-3">
                  <span className={`font-semibold tabular-nums ${TIER_STYLES[l.scoreTier || ""] || "text-ink-900"}`}>
                    {l.score}
                  </span>
                  {l.scoreTier && (
                    <span className="ml-1 text-xs capitalize text-ink-600">{l.scoreTier}</span>
                  )}
                </td>
              )}
              <td className="px-4 py-3 text-ink-600">{l.source}</td>
              <td className="px-4 py-3 text-ink-600">
                {new Date(l.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    STATUS_STYLES[l.status] || "bg-cream-200 text-ink-600"
                  }`}
                >
                  {l.status}
                </span>
                <select
                  value={l.status}
                  disabled={savingId === l.id}
                  onChange={(e) => setStatus(l.id, e.target.value as LeadStatus)}
                  className="rounded-lg border border-cream-200 bg-white px-2 py-1 text-xs outline-none focus:border-brand-400"
                  aria-label={`Change status for ${l.clinicName}`}
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
