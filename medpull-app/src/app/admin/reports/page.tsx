import Link from "next/link";
import { formFunnels, submissionsOverTime, leadStatusFunnel } from "@/lib/reports";
import { LogoutClient } from "@/components/admin/LogoutClient";

export const metadata = { title: "Reports — MedPull Admin" };
export const dynamic = "force-dynamic";

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default async function ReportsPage() {
  const [funnels, overTime, statusFunnel] = await Promise.all([
    formFunnels(),
    submissionsOverTime(30),
    leadStatusFunnel(),
  ]);

  const maxDay = Math.max(1, ...overTime.map((d) => d.leads + d.intake));
  const maxStatus = Math.max(1, ...statusFunnel.map((s) => s.count));

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-ink-600">
            Form completion, submissions over time, and the lead status funnel.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="rounded-xl border border-cream-200 bg-white px-4 py-2 text-sm font-medium text-ink-600 transition hover:text-brand-700"
          >
            ← Leads
          </Link>
          <LogoutClient realm="admin" />
        </div>
      </div>

      {/* Form completion / drop-off */}
      <section className="mt-8">
        <h2 className="font-heading text-xl font-semibold">Form completion &amp; drop-off</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {funnels.map((f) => (
            <div key={f.form} className="rounded-2xl border border-cream-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold capitalize">{f.form} form</h3>
                <span className="text-sm text-ink-600">
                  {pct(f.overallRate)} view → submit
                </span>
              </div>
              {f.viewed === 0 ? (
                <p className="mt-4 text-sm text-ink-600">
                  No funnel events recorded yet. (Submit the {f.form} form to populate this.)
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  <FunnelBar label="Viewed" value={f.viewed} max={f.viewed} />
                  <FunnelBar label="Started" value={f.started} max={f.viewed} />
                  <FunnelBar label="Submitted" value={f.submitted} max={f.viewed} />
                  <p className="pt-2 text-xs text-ink-600">
                    Start rate {pct(f.startRate)} · completion {pct(f.completionRate)} · drop-off{" "}
                    <span className="font-semibold text-accent-500">{pct(f.dropoffRate)}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Submissions over time */}
      <section className="mt-10">
        <h2 className="font-heading text-xl font-semibold">Submissions over time (30 days)</h2>
        <div className="mt-4 rounded-2xl border border-cream-200 bg-white p-6">
          <div className="flex h-48 items-end gap-1">
            {overTime.map((d) => {
              const total = d.leads + d.intake;
              return (
                <div key={d.date} className="group relative flex-1" title={`${d.date}: ${total}`}>
                  <div
                    className="w-full rounded-t bg-brand-500"
                    style={{ height: `${(total / maxDay) * 100}%`, minHeight: total ? 2 : 0 }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-ink-600">
            <span>{overTime[0]?.date}</span>
            <span>
              {overTime.reduce((a, d) => a + d.leads + d.intake, 0)} total submissions
            </span>
            <span>{overTime[overTime.length - 1]?.date}</span>
          </div>
        </div>
      </section>

      {/* Lead status funnel */}
      <section className="mt-10">
        <h2 className="font-heading text-xl font-semibold">Lead status funnel</h2>
        <div className="mt-4 space-y-3 rounded-2xl border border-cream-200 bg-white p-6">
          {statusFunnel.map((s) => (
            <div key={s.status} className="flex items-center gap-4">
              <span className="w-24 text-sm capitalize text-ink-600">{s.status}</span>
              <div className="h-6 flex-1 overflow-hidden rounded bg-cream-100">
                <div
                  className="h-full rounded bg-brand-500"
                  style={{ width: `${(s.count / maxStatus) * 100}%`, minWidth: s.count ? 8 : 0 }}
                />
              </div>
              <span className="w-10 text-right text-sm font-semibold tabular-nums">{s.count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FunnelBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs text-ink-600">{label}</span>
      <div className="h-5 flex-1 overflow-hidden rounded bg-cream-100">
        <div
          className="h-full rounded bg-brand-500"
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, minWidth: value ? 6 : 0 }}
        />
      </div>
      <span className="w-10 text-right text-xs font-semibold tabular-nums">{value}</span>
    </div>
  );
}
