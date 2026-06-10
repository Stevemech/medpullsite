import { SectionHeader } from "./primitives";
import {
  testimonials,
  caseStudies,
  realTestimonials,
  realCaseStudies,
} from "@/content/social-proof";

function Stars() {
  return (
    <div className="flex gap-0.5 text-brand-600" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function PlaceholderBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-500">
      Placeholder
    </span>
  );
}

export function SocialProof() {
  const hasRealTestimonials = realTestimonials.length > 0;
  const hasRealCaseStudies = realCaseStudies.length > 0;

  return (
    <section id="proof" className="bg-cream-50 py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader
          eyebrow="Proof"
          title="Loved by the front desks"
          highlight="that run on it."
          lede="Clinics use MedPull to answer every call, fill their schedules, and give their teams hours back. Here's what that looks like in practice."
        />

        {!hasRealTestimonials && (
          <p className="mt-6 rounded-xl border border-dashed border-cream-200 bg-white px-4 py-3 text-sm text-ink-600">
            No published testimonials yet — showing placeholder slots. Collect real ones under
            checklist task <code className="font-mono">p1-7</code>, then clear the
            <code className="font-mono"> placeholder</code> flags in
            <code className="font-mono"> src/content/social-proof.ts</code>.
          </p>
        )}

        {/* Testimonials grid */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col rounded-2xl border border-cream-200 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <Stars />
                {t.placeholder && <PlaceholderBadge />}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-700">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-200 text-xs font-bold text-brand-700">
                  {t.initials}
                </span>
                <span className="text-sm">
                  <span className="block font-semibold text-ink-900">{t.name}</span>
                  <span className="block text-ink-600">
                    {t.role} · {t.clinic}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Case studies */}
        <div className="mt-12">
          <h3 className="font-heading text-xl font-semibold">Case studies</h3>
          {!hasRealCaseStudies && (
            <p className="mt-2 text-sm text-ink-600">
              Placeholder case studies below — replace with real, consented write-ups.
            </p>
          )}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {caseStudies.map((c) => (
              <article key={c.id} className="rounded-2xl border border-cream-200 bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-ink-900">{c.clinic}</h4>
                  {c.placeholder && <PlaceholderBadge />}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">{c.summary}</p>
                <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-cream-200 pt-4">
                  {c.metrics.map((m) => (
                    <div key={m.label}>
                      <dt className="text-[11px] text-ink-600">{m.label}</dt>
                      <dd className="mt-1 text-sm font-semibold text-brand-700">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
