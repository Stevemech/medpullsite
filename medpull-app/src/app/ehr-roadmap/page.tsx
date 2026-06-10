import type { Metadata } from "next";
import { AnnouncementBar, Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { CtaButton } from "@/components/landing/primitives";
import { roadmap, statusLabels, type RoadmapStatus } from "@/content/ehr-roadmap";

export const metadata: Metadata = {
  title: "EHR Integration Roadmap — MedPull",
  description:
    "Where MedPull connects today and what's next: calendar scheduling, athenahealth, and Epic. Placeholder roadmap pending confirmation.",
};

const statusStyles: Record<RoadmapStatus, string> = {
  live: "bg-success-500/15 text-success-500",
  "in-progress": "bg-brand-500/15 text-brand-700",
  planned: "bg-accent-500/15 text-accent-500",
  exploring: "bg-cream-200 text-ink-600",
};

export default function EhrRoadmapPage() {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main className="mx-auto max-w-[900px] px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          Integrations
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          EHR integration <span className="text-brand-600">roadmap</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-600">
          MedPull works alongside your existing systems. Here&apos;s where we connect today and
          what&apos;s coming next. Timelines below are placeholders pending confirmation.
        </p>

        <div className="mt-6 rounded-xl border border-dashed border-accent-500/40 bg-accent-500/5 px-4 py-3 text-sm text-ink-700">
          <strong>TODO(steve):</strong> replace all timeframes, scope, and statuses with the real
          roadmap written under checklist task <code className="font-mono">p0-9</code>. These are
          illustrative placeholders — not commitments.
        </div>

        <ol className="relative mt-12 space-y-8 border-l border-cream-200 pl-8">
          {roadmap.map((item) => (
            <li key={item.id} className="relative">
              <span className="absolute -left-[37px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-brand-600 bg-cream-50" />
              <div className="rounded-2xl border border-cream-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">{item.system}</h2>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                  >
                    {statusLabels[item.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-brand-700">{item.timeframe}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">{item.scope}</p>
                <ul className="mt-4 space-y-1.5">
                  {item.details.map((d, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink-600">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-2xl bg-cream-100 p-8 text-center">
          <h3 className="font-heading text-2xl font-semibold">
            Want MedPull to support your system?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
            Tell us what you run today. Pilot demand shapes what we build next.
          </p>
          <div className="mt-6 flex justify-center">
            <CtaButton source="ehr-roadmap" className="px-6 py-3 text-base">
              Talk to us about integrations
            </CtaButton>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
