"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CtaButton } from "./primitives";
import { BrandLockup } from "@/components/Brand";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#platform", label: "Platform" },
  { href: "#roi", label: "ROI" },
  { href: "/ehr-roadmap", label: "Integrations" },
  { href: "#faq", label: "FAQ" },
];

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="relative bg-brand-700 px-4 py-2 text-center text-sm text-white">
      <span className="opacity-90">
        Now onboarding a small group of pilot clinics for early 2026.{" "}
      </span>
      <button onClick={() => window.dispatchEvent(new CustomEvent("medpull:open-popup"))} className="font-semibold underline underline-offset-2">
        Request an invite →
      </button>
      <button
        aria-label="Dismiss"
        onClick={() => setOpen(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition ${
        scrolled
          ? "border-b border-cream-200 bg-cream-50/90 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <Link href="/">
          <BrandLockup />
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-600 transition hover:text-brand-700"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <CtaButton source="nav">Request a demo</CtaButton>
        </div>
      </nav>
    </header>
  );
}
