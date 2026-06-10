"use client";

export function LogoutClient({ realm }: { realm: "admin" | "intern" }) {
  const logout = async () => {
    await fetch(`/api/${realm}/login`, { method: "DELETE" });
    window.location.href = `/${realm}/login`;
  };
  return (
    <button
      onClick={logout}
      className="rounded-xl border border-cream-200 bg-white px-4 py-2 text-sm font-medium text-ink-600 transition hover:text-brand-700"
    >
      Sign out
    </button>
  );
}
