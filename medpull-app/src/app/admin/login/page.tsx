import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Admin sign in — MedPull" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next && next.startsWith("/admin") ? next : "/admin";
  return <LoginForm realm="admin" title="Admin dashboard" next={target} />;
}
