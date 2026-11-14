"use client";

import Image from "next/image";
import Link from "next/link";
import Newsletter from "@/components/Newsletter";

const paymentMethods = [
  { name: "UPI", src: "/images/payments/upi.svg", width: 48, height: 18 },
  { name: "Google Pay", src: "/images/payments/gpay.svg", width: 48, height: 18 },
  { name: "PhonePe", src: "/images/payments/phonepe.svg", width: 56, height: 18 },
  { name: "Paytm", src: "/images/payments/paytm.svg", width: 52, height: 16 },
  { name: "Visa", src: "/images/payments/visa.svg", width: 36, height: 24 },
  { name: "Mastercard", src: "/images/payments/mastercard.svg", width: 36, height: 24 },
  { name: "RuPay", src: "/images/payments/rupay.svg", width: 50, height: 16 },
  { name: "Net Banking", src: "/images/payments/netbanking.svg", width: 32, height: 22 },
  { name: "Cash on Delivery", src: "/images/payments/cod.svg", width: 32, height: 22 },
];

const navigationLinks = {
  shop: [
    { label: "All Collections", href: "/collections" },
    { label: "New Arrivals", href: "/shop" },
    { label: "Best Sellers", href: "/best-sellers" },
    { label: "Video Lookbook", href: "/video-collection" },
  ],
  about: [
    { label: "Our Story", href: "/about" },
    { label: "Why Choose Us", href: "/why-choose-us" },
    { label: "Handloom Weaves", href: "/collections/fabric" },
    { label: "Journal", href: "/blog" },
  ],
  help: [
    { label: "Track Order", href: "/track-order" },
    { label: "FAQs", href: "/faq" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Returns & Exchange", href: "/returns" },
    { label: "Contact", href: "/contact" },
  ],
  follow: [
    { label: "Instagram", href: "https://www.instagram.com/_linensaree/" },
    { label: "Facebook", href: "https://www.facebook.com/people/Linensareecom/100063776541814/" },
    { label: "WhatsApp", href: "https://wa.me/919264151111" },
    { label: "YouTube", href: "https://www.youtube.com/@linensaree" },
  ],
};

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="mt-auto border-t border-pine-950/10 bg-linen">
      <div className="mx-auto max-w-[1240px] px-6 pb-10 pt-10 sm:px-8 lg:px-10 lg:pb-12 lg:pt-14">
        {/* Newsletter subscription */}
        <Newsletter />

        {/* Top Header Row: Brand Identity & Back to Top (from linen-saree) */}
        <div className="mt-12 flex flex-col gap-4 border-b border-pine-950/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="inline-block cursor-pointer">
              <span className="font-display text-2xl font-semibold uppercase tracking-[0.16em] text-pine-900 transition-colors hover:text-pine-700 sm:text-3xl">
                Linen Saree
              </span>
            </Link>
            <p className="mt-1 text-xs font-light tracking-wide text-muted sm:text-sm">
              Authentic Handcrafted Pure Linen Sarees
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="group flex cursor-pointer items-center gap-2 self-start font-inter text-xs uppercase tracking-wider text-pine-900 transition-colors hover:text-pine-700 sm:self-auto"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:-translate-y-0.5"
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>

        {/* Navigation Grid: 4 Columns (Shop, About, Help, Follow) */}
        <div className="grid grid-cols-2 gap-8 py-10 sm:gap-10 md:grid-cols-4">
          {/* Column 1: Shop */}
          <div className="space-y-3.5">
            <h4 className="font-inter text-xs font-semibold uppercase tracking-[0.18em] text-pine-900">
              Shop
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              {navigationLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="cursor-pointer text-ink transition-colors hover:text-pine-900 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: About */}
          <div className="space-y-3.5">
            <h4 className="font-inter text-xs font-semibold uppercase tracking-[0.18em] text-pine-900">
              About
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              {navigationLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="cursor-pointer text-ink transition-colors hover:text-pine-900 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help */}
          <div className="space-y-3.5">
            <h4 className="font-inter text-xs font-semibold uppercase tracking-[0.18em] text-pine-900">
              Help
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              {navigationLinks.help.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="cursor-pointer text-ink transition-colors hover:text-pine-900 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Follow */}
          <div className="space-y-3.5">
            <h4 className="font-inter text-xs font-semibold uppercase tracking-[0.18em] text-pine-900">
              Follow
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              {navigationLinks.follow.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex cursor-pointer items-center gap-1 text-ink transition-colors hover:text-pine-900 hover:underline"
                  >
                    <span>{link.label}</span>
                    <span className="text-[10px] text-muted transition-colors group-hover:text-pine-900">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 100% Secure Payment Methods Section (Official Image Logos & Names) */}
        <div className="border-t border-pine-950/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-pine-900">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-pine-800"
                aria-hidden="true"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>100% Secure &amp; Verified Payments</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="flex items-center gap-2 rounded-md border border-pine-950/15 bg-white px-2.5 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-transform hover:-translate-y-0.5"
                >
                  <Image
                    src={method.src}
                    alt={method.name}
                    width={method.width}
                    height={method.height}
                    unoptimized
                    className="h-4 w-auto max-h-4 max-w-[48px] shrink-0 object-contain"
                  />
                  <span className="whitespace-nowrap font-inter text-[11px] font-medium text-pine-950">
                    {method.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Row */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-pine-950/10 pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Linen Saree. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs text-muted">
            <Link href="/privacy" className="cursor-pointer transition-colors hover:text-pine-900 hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="cursor-pointer transition-colors hover:text-pine-900 hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
