import type { Metadata } from "next";
import { AnnouncementBar, Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { PricingCalculator, TierCards } from "@/components/pricing/PricingCalculator";

export const metadata: Metadata = {
  title: "Pricing — MedPull",
  description: "Estimate your MedPull plan by clinic size. Placeholder pricing.",
};

export default function PricingPage() {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main className="mx-auto max-w-[1100px] px-6 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            Pricing
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Pricing that scales with <span className="text-brand-600">your front desk.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
            Estimate a plan by your call volume and locations. These are placeholder figures —
            we&apos;ll give you an exact quote.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="font-heading text-xl font-semibold">Estimate your plan</h2>
          <div className="mt-4">
            <PricingCalculator />
          </div>
        </div>

        <div className="mt-14">
          <h2 className="font-heading text-xl font-semibold">Plans</h2>
          <div className="mt-4">
            <TierCards />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
