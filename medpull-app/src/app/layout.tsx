import type { Metadata } from "next";
import { EB_Garamond, Inter, Outfit } from "next/font/google";
import LeadPopup from "@/components/LeadPopup";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
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

export const metadata: Metadata = {
  title: "MedPull — AI Front Desk for Clinics",
  description:
    "MedPull answers every patient call, fills your schedule, and gives your front desk hours back — purpose-built for independent clinics.",
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
      </body>
    </html>
  );
}
