"use client";

import { openLeadPopup } from "@/components/LeadPopup";

/** The one reusable CTA button. Opens the interest popup. */
export function CtaButton({
  children,
  variant = "solid",
  className = "",
  source = "cta",
}: {
  children: React.ReactNode;
  variant?: "solid" | "inverted";
  className?: string;
  source?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md";
  const styles =
    variant === "inverted"
      ? "bg-white text-brand-700 hover:bg-white/90"
      : "bg-brand-600 text-white hover:bg-brand-700";
  return (
    <button
      data-cta-source={source}
      onClick={() => openLeadPopup()}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

/** Eyebrow → heading → lede block used to head most sections. */
export function SectionHeader({
  eyebrow,
  title,
  highlight,
  lede,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  lede?: string;
  align?: "left" | "center";
}) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`${alignment} max-w-2xl`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        {title} {highlight && <span className="text-brand-600">{highlight}</span>}
      </h2>
      {lede && <p className="mt-5 text-base leading-relaxed text-ink-600">{lede}</p>}
    </div>
  );
}

export function ArrowLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick ?? (() => openLeadPopup())}
      className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:gap-3"
    >
      {children}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
