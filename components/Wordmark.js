import Image from "next/image";
import Link from "next/link";

export default function Wordmark({ className = "" }) {
  return (
    <Link
      href="/"
      aria-label="Linen Saree — home"
      className={`flex shrink-0 items-center gap-2 leading-none cursor-pointer ${className}`}
    >
      <Image
        src="/linen-saree-logo.png"
        alt="Linen Saree Logo"
        width={140}
        height={40}
        priority
        className="h-8 sm:h-9 lg:h-10 w-auto object-contain"
      />
    </Link>
  );
}
