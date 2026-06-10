"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LEAD_STATUSES } from "@/lib/validators";

/** Search / filter / sort controls. Pushes query params; the server re-queries. */
export function AdminToolbar({
  q,
  status,
  sort,
}: {
  q: string;
  status: string;
  sort: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);

  const apply = (next: { q?: string; status?: string; sort?: string }) => {
    const params = new URLSearchParams();
    const merged = { q: query, status, sort, ...next };
    if (merged.q) params.set("q", merged.q);
    if (merged.status) params.set("status", merged.status);
    if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);
    router.push(`/admin${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: query });
        }}
        className="flex flex-1 items-center gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clinic, contact, email, or phone…"
          className="w-full max-w-md rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Search
        </button>
      </form>

      <select
        value={status}
        onChange={(e) => apply({ status: e.target.value })}
        className="rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => apply({ sort: e.target.value })}
        className="rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        aria-label="Sort"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="score">Highest score</option>
      </select>
    </div>
  );
}
