import type { Metadata } from "next";
import { EB_Garamond, Inter, Outfit } from "next/font/google";
import LeadPopup from "@/components/LeadPopup";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { CommandPalette } from "@/components/CommandPalette";
import "./globals.css";

// MedPull fonts: Inter (body/UI), EB Garamond (editorial headings),
// Outfit (the modern logo wordmark).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-eb-garamond",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://medpull.org";
const DESCRIPTION =
  "MedPull answers every patient call, fills your schedule, and gives your front desk hours back — purpose-built for independent clinics.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "MedPull — AI Front Desk for Clinics",
  description: DESCRIPTION,
  applicationName: "MedPull",
  keywords: [
    "AI front desk",
    "medical answering service",
    "clinic phone automation",
    "patient scheduling",
    "appointment booking AI",
  ],
  openGraph: {
    type: "website",
    siteName: "MedPull",
    title: "MedPull — AI Front Desk for Clinics",
    description: DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/medpull-logo.png", width: 481, height: 459, alt: "MedPull" }],
  },
  twitter: {
    card: "summary",
    title: "MedPull — AI Front Desk for Clinics",
    description: DESCRIPTION,
    images: ["/medpull-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${inter.variable} ${outfit.variable}`}>
      <body className="antialiased">
        <AnalyticsProvider />
        {children}
        <LeadPopup />
        <CommandPalette />
      </body>
    </html>
  );
}
