"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/components/StoreProvider";
import {
  STATIC_NAV_LINKS,
  ACCOUNT_LINKS,
  buildCategoryLinks,
  buildCollectionLinks,
} from "@/lib/navigation";

export default function MobileNav({ open, onClose }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const { categories, collectionsData } = useStore();

  useEffect(() => {
    if (!open) return;
    const reset = setTimeout(() => setExpandedSection(null), 0);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(reset);
      document.body.style.overflow = original;
    };
  }, [open]);

  const categoryLinks = useMemo(
    () => buildCategoryLinks(categories),
    [categories]
  );

  const collectionLinks = useMemo(
    () => buildCollectionLinks(collectionsData),
    [collectionsData]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-pine-950/45 backdrop-blur-[2px] transition-opacity"
      />
      <div className="relative flex h-full w-[86%] max-w-sm flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-300">
        <header className="flex items-center justify-between border-b border-pine-950/10 px-4 py-3.5">
          <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-pine-900">
            Linen Saree
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-pine-900 transition-colors hover:bg-linen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <nav aria-label="Mobile Navigation" className="flex-1 overflow-y-auto px-3 py-3">
          {/* Categories Accordion */}
          <div className="border-b border-pine-950/10">
            <button
              type="button"
              onClick={() => setExpandedSection(expandedSection === "categories" ? null : "categories")}
              aria-expanded={expandedSection === "categories"}
              className="flex w-full items-center justify-between px-2 py-3.5 text-left"
            >
              <span className="font-inter text-[13px] font-semibold uppercase tracking-wide text-pine-950">
                Categories
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className={`text-pine-900 transition-transform duration-200 ${
                  expandedSection === "categories" ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {expandedSection === "categories" && (
              <ul className="space-y-1 pb-3 pl-3">
                {categoryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="block rounded-md px-3 py-2 font-inter text-[13px] text-ink transition-colors hover:bg-linen"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Collections Accordion */}
          <div className="border-b border-pine-950/10">
            <button
              type="button"
              onClick={() => setExpandedSection(expandedSection === "collections" ? null : "collections")}
              aria-expanded={expandedSection === "collections"}
              className="flex w-full items-center justify-between px-2 py-3.5 text-left"
            >
              <span className="font-inter text-[13px] font-semibold uppercase tracking-wide text-pine-950">
                Collections
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className={`text-pine-900 transition-transform duration-200 ${
                  expandedSection === "collections" ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {expandedSection === "collections" && (
              <ul className="space-y-1 pb-3 pl-3">
                <li>
                  <Link
                    href="/collections"
                    onClick={onClose}
                    className="block rounded-md px-3 py-2 font-inter text-[13px] font-semibold text-pine-950 transition-colors hover:bg-linen"
                  >
                    All Collections
                  </Link>
                </li>
                {collectionLinks.map((col) => (
                  <li key={col.href}>
                    <Link
                      href={col.href}
                      onClick={onClose}
                      className="block rounded-md px-3 py-2 font-inter text-[13px] text-ink transition-colors hover:bg-linen"
                    >
                      <span>{col.label}</span>
                      {col.tagline && <span className="block text-[10px] text-muted">{col.tagline}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Restored Main Direct Links */}
          <div className="py-2 border-b border-pine-950/10 space-y-1">
            {STATIC_NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`block px-2 py-2.5 font-inter text-[13px] transition-colors hover:bg-linen rounded ${
                  item.isHighlight
                    ? "font-semibold text-[#b42318]"
                    : "font-medium text-pine-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Customer / Account Links */}
          <div className="py-3">
            <span className="block px-2 pb-1 font-inter text-[11px] font-semibold uppercase tracking-wider text-muted">
              Account & Support
            </span>
            <ul className="mt-1 space-y-0.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block px-2 py-2 font-inter text-[13px] text-ink transition-colors hover:bg-linen rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
