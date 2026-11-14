"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";

export default function AccountLink() {
  const { user, logout } = useStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="User account menu"
        className="flex h-9 items-center gap-1.5 rounded-full bg-white px-3 font-inter text-xs font-medium text-pine-900 shadow-sm transition-colors hover:bg-linen"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="hidden sm:inline">{user ? user.name?.split(" ")[0] || "Account" : "Sign In"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-pine-950/10 bg-white py-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
          {user ? (
            <>
              <div className="border-b border-pine-950/10 px-3 py-2 text-[11px] text-muted">
                Signed in as <span className="font-semibold text-pine-950">{user.email || user.name}</span>
              </div>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 font-inter text-xs text-ink hover:bg-linen transition-colors"
              >
                My Account
              </Link>
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 font-inter text-xs text-ink hover:bg-linen transition-colors"
              >
                My Orders
              </Link>
              <Link
                href="/track-order"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 font-inter text-xs text-ink hover:bg-linen transition-colors"
              >
                Track Order
              </Link>
              <div className="border-t border-pine-950/10 my-1" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout().catch(console.error);
                }}
                className="block w-full text-left px-3 py-2 font-inter text-xs text-red-700 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 font-inter text-xs text-ink hover:bg-linen transition-colors"
              >
                Sign In / Register
              </Link>
              <Link
                href="/track-order"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 font-inter text-xs text-ink hover:bg-linen transition-colors"
              >
                Track Order
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
