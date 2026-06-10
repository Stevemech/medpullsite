import { listLeads, statusCounts } from "@/lib/leads";
import { LEAD_STATUSES } from "@/lib/validators";
import { scoreLead } from "@/config/lead-scoring";
import { LeadsTable, type LeadRow } from "@/components/admin/LeadsTable";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { LogoutClient } from "@/components/admin/LogoutClient";

export const metadata = { title: "Leads — MedPull Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const sort = (sp.sort as "newest" | "oldest" | "score") || "newest";
  const [leads, counts] = await Promise.all([
    listLeads({ q: sp.q, status: sp.status, sort }),
    statusCounts(),
  ]);

  const now = Date.now();
  let rows: LeadRow[] = leads.map((l) => {
    const { score, tier } = scoreLead(l, now);
    return {
      id: l.id,
      clinicName: l.clinicName,
      contactName: l.contactName,
      email: l.email,
      phone: l.phone,
      consent: l.consent,
      source: l.source,
      status: l.status,
      score,
      scoreTier: tier,
      createdAt: l.createdAt.toISOString(),
    };
  });

  // Score is computed in app code, so the "highest score" sort happens here.
  if (sort === "score") {
    rows = [...rows].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-ink-600">
            {total} total · {counts.new} new · {counts.contacted} contacted ·{" "}
            {counts.scheduled} scheduled · {counts.closed} closed
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin/reports"
            className="rounded-xl border border-cream-200 bg-white px-4 py-2 text-sm font-medium text-ink-600 transition hover:text-brand-700"
          >
            Reports →
          </a>
          <a
            href="/admin/intake"
            className="rounded-xl border border-cream-200 bg-white px-4 py-2 text-sm font-medium text-ink-600 transition hover:text-brand-700"
          >
            Pilot intake →
          </a>
          <LogoutClient realm="admin" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {LEAD_STATUSES.map((s) => (
          <div key={s} className="rounded-xl border border-cream-200 bg-white px-4 py-2 text-sm">
            <span className="font-semibold tabular-nums">{counts[s]}</span>{" "}
            <span className="capitalize text-ink-600">{s}</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <AdminToolbar q={sp.q ?? ""} status={sp.status ?? ""} sort={sort} />
      </div>

      <div className="mt-6">
        <LeadsTable initialLeads={rows} />
      </div>
    </div>
  );
}
