import type { Metadata } from "next";
import { AnnouncementBar, Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { CalEmbed } from "@/components/CalEmbed";

export const metadata: Metadata = {
  title: "Book a demo — MedPull",
  description: "Pick a time to see MedPull in action.",
};

function normalizeCalUrl(raw: string | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const url = raw.trim();
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

export default function BookPage() {
  const url = normalizeCalUrl(process.env.CAL_COM_URL);
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main className="mx-auto max-w-[900px] px-6 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            Schedule
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Find a time that <span className="text-brand-600">works for you.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
            A short, no-pressure walkthrough of how MedPull handles your front desk.
          </p>
        </div>
        <div className="mt-10">
          <CalEmbed url={url} />
        </div>
      </main>
      <Footer />
    </>
  );
}
