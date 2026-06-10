import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Intern sign in — MedPull" };

export default async function InternLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next && next.startsWith("/intern") ? next : "/intern";
  return <LoginForm realm="intern" title="Intern dashboard" next={target} />;
}
