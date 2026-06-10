/* MedPull logo + wordmark. The mark is the company logo PNG in /public. */

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  // Plain <img> (not next/image) keeps this usable in both server and client
  // components without width/height plumbing; the asset is small.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/medpull-logo.png" alt="MedPull" className={`${className} object-contain`} />;
}

export function BrandLockup({
  light = false,
  className = "",
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <Logo className="h-8 w-8" />
      <span
        className={`font-brand text-xl font-semibold tracking-tight ${
          light ? "text-white" : "text-ink-900"
        }`}
      >
        MedPull
      </span>
    </span>
  );
}
