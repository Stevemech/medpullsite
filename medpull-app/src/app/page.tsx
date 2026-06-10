import { AnnouncementBar, Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import {
  LogoMarquee,
  ProblemStats,
  Features,
  HowItWorks,
  Faq,
  FinalCta,
  Footer,
} from "@/components/landing/Sections";
import { RoiCalculator } from "@/components/landing/RoiCalculator";
import { SocialProof } from "@/components/landing/SocialProof";
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
        <LogoMarquee />
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
        <Reveal>
          <SocialProof />
        </Reveal>
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
