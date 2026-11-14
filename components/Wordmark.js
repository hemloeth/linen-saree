import Link from "next/link";

export default function Wordmark({ className = "" }) {
  return (
    <Link
      href="/"
      aria-label="Linen Saree — home"
      className={`flex shrink-0 items-center leading-none ${className}`}
    >
      <span className="font-display text-[18px] font-semibold uppercase tracking-[0.14em] text-pine-900 sm:text-[21px] lg:text-[24px]">
        Linen Saree
      </span>
    </Link>
  );
}
