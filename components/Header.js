"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import BagButton from "@/components/BagButton";
import CartDrawer from "@/components/CartDrawer";
import MobileNav from "@/components/MobileNav";
import { useStore } from "@/components/StoreProvider";
import SearchModal from "@/components/SearchModal";
import WishlistButton from "@/components/WishlistButton";
import Wordmark from "@/components/Wordmark";
import AccountLink from "@/components/account/AccountLink";
import {
  STATIC_NAV_LINKS,
  buildCategoryLinks,
  buildCollectionLinks,
} from "@/lib/navigation";

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Dropdown({ label, href, children, open, onToggle, onClose }) {
  return (
    <div
      className="relative"
      onMouseEnter={onToggle}
      onMouseLeave={onClose}
    >
      <div className="flex items-center gap-1">
        <Link
          href={href || "#"}
          className="font-inter text-[13px] font-medium text-pine-900 underline-offset-4 hover:underline"
        >
          {label}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`Toggle ${label} menu`}
          className="p-0.5 text-pine-900"
        >
          <Chevron />
        </button>
      </div>
      {open ? (
        <div className="absolute left-0 top-full z-50 min-w-64 pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="rounded-md border border-pine-950/10 bg-white p-2 shadow-xl">
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Header() {
  const { openSearch, categories, collectionsData } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const headerRef = useRef(null);

  const categoryLinks = useMemo(
    () => buildCategoryLinks(categories),
    [categories]
  );

  const collectionLinks = useMemo(
    () => buildCollectionLinks(collectionsData),
    [collectionsData]
  );

  // Publish the header height so pages can offset anchors/scrolls (--header-offset).
  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    const apply = () => {
      document.documentElement.style.setProperty(
        "--header-offset",
        `${Math.round(node.getBoundingClientRect().height)}px`
      );
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  // Keyboard shortcut for search (Ctrl/Cmd + K) and Escape to close dropdowns
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape") {
        setOpenMenu(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  return (
    <>
      <header id="main-header" ref={headerRef} className="sticky top-0 z-50">
        <AnnouncementBar />

        <div className="border-b border-pine-950/10 bg-sage">
          <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-3 px-3 sm:px-4 lg:h-20 lg:px-6 xl:px-10">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-pine-800 shadow-sm transition-colors hover:bg-linen lg:hidden"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
              <Wordmark />
            </div>

            <nav aria-label="Main" className="hidden items-center gap-3 lg:flex xl:gap-5 2xl:gap-6 shrink-0">
              {/* Dynamic Categories Dropdown */}
              <Dropdown
                label="Categories"
                href="/categories"
                open={openMenu === "categories"}
                onToggle={() => setOpenMenu(openMenu === "categories" ? null : "categories")}
                onClose={() => setOpenMenu(null)}
              >
                <ul className="max-h-80 overflow-y-auto">
                  {categoryLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpenMenu(null)}
                        className="block rounded px-3 py-2 font-inter text-[13px] text-ink transition-colors hover:bg-linen"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Dropdown>

              {/* Dynamic Collections Dropdown */}
              <Dropdown
                label="Collections"
                href="/collections"
                open={openMenu === "collections"}
                onToggle={() => setOpenMenu(openMenu === "collections" ? null : "collections")}
                onClose={() => setOpenMenu(null)}
              >
                <ul className="max-h-80 overflow-y-auto">
                  <li key="all-collections">
                    <Link
                      href="/collections"
                      onClick={() => setOpenMenu(null)}
                      className="block rounded px-3 py-2 font-inter text-[13px] font-semibold text-pine-950 transition-colors hover:bg-linen"
                    >
                      All Collections
                    </Link>
                  </li>
                  {collectionLinks.map((collection) => (
                    <li key={collection.href}>
                      <Link
                        href={collection.href}
                        onClick={() => setOpenMenu(null)}
                        className="block rounded px-3 py-2 transition-colors hover:bg-linen"
                      >
                        <span className="block font-inter text-[13px] text-ink">{collection.label}</span>
                        {collection.tagline && (
                          <span className="block font-inter text-[10px] text-muted">{collection.tagline}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Dropdown>

              {/* Restored Navigation Links */}
              {STATIC_NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-inter text-[13px] underline-offset-4 hover:underline ${
                    item.isHighlight
                      ? "font-semibold text-[#b42318]"
                      : "font-medium text-pine-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Compact search pill for desktop */}
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search products"
                className="hidden h-8 cursor-pointer items-center gap-1.5 rounded-full bg-white/85 px-2.5 text-faint ring-1 ring-pine-950/10 transition-colors hover:bg-white hover:text-pine-950 lg:flex lg:w-24 xl:w-28"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="shrink-0 text-pine-900">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <span className="text-[11px] font-medium text-pine-900">Search</span>
                <kbd className="ml-auto hidden rounded border border-pine-950/15 px-1 font-inter text-[8px] text-muted xl:inline">⌘K</kbd>
              </button>

              {/* Icon search button for mobile and tablet */}
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search products"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-pine-800 shadow-sm transition-colors hover:bg-linen lg:hidden"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>

              <WishlistButton />
              <AccountLink />
              <BagButton />
            </div>
          </div>
        </div>
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchModal />
      <CartDrawer />
    </>
  );
}
