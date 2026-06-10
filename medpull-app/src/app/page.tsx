import { AnnouncementBar, Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import {
  ProblemStats,
  Features,
  HowItWorks,
  Faq,
  FinalCta,
  Footer,
} from "@/components/landing/Sections";
// LogoMarquee and SocialProof are intentionally not imported while their
// sections are suppressed (see comments in the JSX below) — re-add when restoring.
import { RoiCalculator } from "@/components/landing/RoiCalculator";
import { CallDemo } from "@/components/landing/CallDemo";
import { ImpactMetrics } from "@/components/landing/ImpactMetrics";
import { Reveal } from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>
        <Hero />
        {/* Suppressed until we have real client logos + permission to display them.
            Re-enable by restoring <LogoMarquee /> here. */}
        {/* <LogoMarquee /> */}
        <CallDemo />
        <Reveal>
          <ProblemStats />
        </Reveal>
        <Reveal>
          <Features />
        </Reveal>
        <Reveal>
          <RoiCalculator />
        </Reveal>
        <Reveal>
          <HowItWorks />
        </Reveal>
        <ImpactMetrics />
        {/* Suppressed until we have real, consented testimonials + case studies.
            Re-enable by restoring <SocialProof /> here. */}
        {/* <Reveal><SocialProof /></Reveal> */}
        <Reveal>
          <Faq />
        </Reveal>
        <Reveal>
          <FinalCta />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
