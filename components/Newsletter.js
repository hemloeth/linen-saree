"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(event) {
    event.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setDone(true);
  }

  return (
    <div>
      <h2 className="text-center font-display text-base font-semibold uppercase tracking-[0.12em] text-pine-950 sm:text-lg">
        Get notified when we launch
      </h2>
      {done ? (
        <p role="status" className="mx-auto mt-3 max-w-xs text-center text-sm text-pine-800">
          Thank you! We&apos;ll notify you at {email} when we launch.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mx-auto mt-3 flex max-w-sm gap-2">
          <label className="flex h-10 flex-1 items-center gap-2 rounded-md border border-hairline bg-white px-3">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-faint">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
            />
          </label>
          <button
            type="submit"
            className="h-10 shrink-0 cursor-pointer rounded-md bg-pine-900 px-4 font-inter text-xs font-medium text-white transition-colors hover:bg-pine-950"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
