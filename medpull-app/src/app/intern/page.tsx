import { listInternStats } from "@/lib/referrals";
import { formatCents } from "@/config/commissions";
import { LogoutClient } from "@/components/admin/LogoutClient";
import { ReferralLink } from "@/components/intern/ReferralLink";

export const metadata = { title: "Intern dashboard — MedPull" };
export const dynamic = "force-dynamic";

export default async function InternDashboard() {
  const interns = await listInternStats();

  const totals = interns.reduce(
    (acc, i) => {
      acc.leads += i.referredLeads;
      acc.conversions += i.conversions;
      acc.cents += i.totalCents;
      return acc;
    },
    { leads: 0, conversions: 0, cents: 0 }
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Intern dashboard</h1>
          <p className="mt-1 text-sm text-ink-600">
            {interns.length} intern(s) · {totals.leads} referred leads · {totals.conversions}{" "}
            conversions · {formatCents(totals.cents)} in commissions
          </p>
        </div>
        <LogoutClient realm="intern" />
      </div>

      {interns.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-cream-200 bg-white p-12 text-center text-ink-600">
          No interns yet. Seed some with <code className="font-mono">npm run seed:interns</code>.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {interns.map((i, idx) => (
            <div key={i.internId} className="rounded-2xl border border-cream-200 bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold">{i.name}</h2>
                  <p className="text-sm text-ink-600">
                    Referral code <code className="rounded bg-cream-100 px-1.5 py-0.5 font-mono text-brand-700">{i.referralCode}</code>
                  </p>
                </div>
                {idx === 0 && totals.cents > 0 && (
                  <span className="rounded-full bg-accent-500/15 px-2.5 py-1 text-xs font-semibold text-accent-500">
                    Top earner
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat label="Referred" value={i.referredLeads.toString()} />
                <Stat label="Conversions" value={i.conversions.toString()} />
                <Stat label="Earned" value={formatCents(i.totalCents)} accent />
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-cream-200 pt-4 text-sm">
                <div>
                  <dt className="text-xs text-ink-600">Pending</dt>
                  <dd className="font-semibold tabular-nums">{formatCents(i.pendingCents)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-600">Approved</dt>
                  <dd className="font-semibold tabular-nums">{formatCents(i.approvedCents)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-600">Paid</dt>
                  <dd className="font-semibold tabular-nums">{formatCents(i.paidCents)}</dd>
                </div>
              </dl>

              <ReferralLink code={i.referralCode} />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-cream-50 p-3">
      <p className="text-[11px] text-ink-600">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${accent ? "text-brand-700" : ""}`}>
        {value}
      </p>
    </div>
  );
}
