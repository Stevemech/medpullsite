import type { Metadata } from "next";
import { AnnouncementBar, Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { IntakeForm } from "@/components/intake/IntakeForm";

export const metadata: Metadata = {
  title: "Pilot intake — MedPull",
  description: "Tell us about your practice to get set up for the MedPull pilot.",
};

export default function IntakePage() {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            Pilot intake
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Let&apos;s get your clinic <span className="text-brand-600">set up.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-ink-600">
            A few details about your practice so we can tailor your pilot. Takes about three
            minutes. Your contact information is encrypted at rest.
          </p>
        </div>
        <div className="mt-10">
          <IntakeForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
