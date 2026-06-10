"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient, mouse-reactive aurora behind the hero. Two slow-drifting brand-color
 * blobs plus a soft spotlight that eases toward the cursor. Purely decorative
 * (pointer-events: none) and static under prefers-reduced-motion.
 */
export function HeroAurora() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 50;
    let ty = 35;
    let x = 50;
    let y = 35;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
    };
    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ ["--mx" as string]: "50%", ["--my" as string]: "35%" }}
    >
      {/* cursor spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(420px 420px at var(--mx) var(--my), rgba(37,99,235,0.10), transparent 70%)",
        }}
      />
      {/* drifting brand blobs */}
      <div className="aurora-a absolute -left-24 -top-24 h-[460px] w-[460px] rounded-full bg-brand-400/25 blur-3xl" />
      <div className="aurora-b absolute -right-20 top-10 h-[420px] w-[420px] rounded-full bg-[#06b6d4]/20 blur-3xl" />
      <div className="aurora-a absolute left-1/3 top-40 h-[360px] w-[360px] rounded-full bg-[#7c3aed]/15 blur-3xl" />
    </div>
  );
}
