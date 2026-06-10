"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { openLeadPopup } from "@/components/LeadPopup";

/**
 * ⌘K / Ctrl-K command palette: fuzzy quick-nav and actions across the site.
 * Keyboard-first (arrows + enter + esc), with a subtle always-visible trigger.
 */
type Command = {
  id: string;
  label: string;
  hint: string;
  keywords?: string;
  run: (router: ReturnType<typeof useRouter>) => void;
};

const go = (path: string) => (router: ReturnType<typeof useRouter>) => router.push(path);

const COMMANDS: Command[] = [
  { id: "demo-cta", label: "Request a demo", hint: "Action", keywords: "contact sales trial pilot invite", run: () => openLeadPopup() },
  { id: "book", label: "Book a demo call", hint: "Page", keywords: "schedule calendar meeting", run: go("/book") },
  { id: "calldemo", label: "Watch MedPull take a call", hint: "Section", keywords: "live demo example", run: go("/#demo") },
  { id: "how", label: "How it works", hint: "Section", keywords: "steps onboarding setup", run: go("/#how") },
  { id: "platform", label: "Platform & features", hint: "Section", keywords: "capabilities what it does", run: go("/#platform") },
  { id: "roi", label: "ROI calculator", hint: "Section", keywords: "savings cost estimate", run: go("/#roi") },
  { id: "proof", label: "Reviews & case studies", hint: "Section", keywords: "testimonials customers social proof", run: go("/#proof") },
  { id: "faq", label: "FAQ", hint: "Section", keywords: "questions answers hipaa", run: go("/#faq") },
  { id: "pricing", label: "Pricing", hint: "Page", keywords: "plans tiers cost", run: go("/pricing") },
  { id: "ehr", label: "EHR integrations roadmap", hint: "Page", keywords: "epic athenahealth", run: go("/ehr-roadmap") },
  { id: "intake", label: "Start pilot intake", hint: "Page", keywords: "onboard sign up apply", run: go("/intake") },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) =>
      `${c.label} ${c.hint} ${c.keywords ?? ""}`.toLowerCase().includes(q)
    );
  }, [query]);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setQuery("");
      setActive(0);
    }, 180);
  }, []);

  const openPalette = useCallback(() => {
    setClosing(false);
    setOpen(true);
    setActive(0);
  }, []);

  // Global ⌘K / Ctrl-K toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else openPalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, openPalette]);

  useEffect(() => {
    if (open && !closing) inputRef.current?.focus();
  }, [open, closing]);

  useEffect(() => setActive(0), [query]);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = results[active];
      if (cmd) {
        close();
        cmd.run(router);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <>
      {/* always-visible subtle trigger */}
      <button
        onClick={openPalette}
        aria-label="Open command palette"
        className="fixed bottom-5 right-5 z-30 hidden items-center gap-2 rounded-full border border-cream-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-ink-600 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:text-brand-700 hover:shadow-xl sm:flex"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Quick nav
        <kbd className="rounded border border-cream-200 bg-cream-50 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
          ⌘K
        </kbd>
      </button>

      {(open || closing) && (
        <div
          className={`fixed inset-0 z-50 flex items-start justify-center bg-ink-900/50 p-4 pt-[12vh] backdrop-blur-sm ${
            closing ? "backdrop-exit" : "backdrop-enter"
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onKeyDown={onListKey}
            className={`w-full max-w-lg overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-2xl ${
              closing ? "dialog-exit" : "dialog-enter"
            }`}
          >
            <div className="flex items-center gap-3 border-b border-cream-200 px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-600">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a page, section, or action…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink-600/60"
              />
              <kbd className="rounded border border-cream-200 bg-cream-50 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
                esc
              </kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-ink-600">No matches.</li>
              )}
              {results.map((c, i) => (
                <li key={c.id}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      close();
                      c.run(router);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      i === active ? "bg-brand-50 text-brand-700" : "text-ink-900 hover:bg-cream-50"
                    }`}
                  >
                    <span className="font-medium">{c.label}</span>
                    <span className="text-xs text-ink-600">{c.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
