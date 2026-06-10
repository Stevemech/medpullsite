import Link from "next/link";
import { headers } from "next/headers";
import { listIntakeDecrypted } from "@/lib/intake";
import { LogoutClient } from "@/components/admin/LogoutClient";

export const metadata = { title: "Intake — MedPull Admin" };
export const dynamic = "force-dynamic";

export default async function AdminIntakePage() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
  // Decrypting for display is itself an audited action.
  const submissions = await listIntakeDecrypted({ actor: "admin-dashboard", ip });

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Pilot intake</h1>
          <p className="mt-1 text-sm text-ink-600">
            {submissions.length} submission(s). Contact fields are decrypted here and the view is
            audited.
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

      {submissions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-cream-200 bg-white p-12 text-center text-ink-600">
          No intake submissions yet.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {submissions.map((s) => (
            <article key={s.id} className="rounded-2xl border border-cream-200 bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold">{s.practiceName}</h2>
                  <p className="text-sm text-ink-600">
                    {s.specialty}
                    {s.city ? ` · ${s.city}` : ""}
                    {s.state ? `, ${s.state}` : ""} · {s.locations} location(s)
                  </p>
                </div>
                <span className="rounded-full bg-brand-500/15 px-2.5 py-1 text-xs font-semibold capitalize text-brand-700">
                  {s.status}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Detail label="EHR" value={s.ehrSystem} />
                <Detail label="Scheduling" value={s.schedulingSystem} />
                <Detail label="Phone system" value={s.phoneSystem} />
                <Detail label="Monthly visits" value={s.monthlyVisits?.toString()} />
                <Detail label="Weekly calls" value={s.weeklyCalls?.toString()} />
                <Detail label="Providers" value={s.providers?.toString()} />
                <Detail
                  label="Est. missed calls"
                  value={s.missedPctEstimate != null ? `${s.missedPctEstimate}%` : undefined}
                />
              </dl>

              <div className="mt-4 rounded-xl bg-cream-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  Contact (decrypted)
                </p>
                <p className="mt-2 text-sm font-medium text-ink-900">
                  {s.contactName}
                  {s.contactRole ? ` · ${s.contactRole}` : ""}
                </p>
                <p className="text-sm text-ink-600">{s.contactEmail}</p>
                <p className="text-sm text-ink-600">{s.contactPhone}</p>
                {s.bestTime && <p className="mt-1 text-xs text-ink-600">Best time: {s.bestTime}</p>}
              </div>

              {s.notes && <p className="mt-3 text-sm text-ink-600">“{s.notes}”</p>}
              <p className="mt-3 text-xs text-ink-600/70">
                Received {s.createdAt.toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-ink-600">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}
