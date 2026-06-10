"use client";

import { useState } from "react";
import { BrandLockup } from "@/components/Brand";

/** Shared password login form for the admin and intern realms. */
export function LoginForm({
  realm,
  title,
  next,
}: {
  realm: "admin" | "intern";
  title: string;
  next: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/${realm}/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        window.location.href = next || `/${realm}`;
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-cream-200 bg-white p-8 shadow-sm"
      >
        <BrandLockup />
        <h1 className="mt-6 font-heading text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-ink-600">Enter the access password to continue.</p>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <label htmlFor="pw" className="mt-5 block text-sm font-medium">
          Password
        </label>
        <input
          id="pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mt-1 w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
          placeholder="••••••••"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
