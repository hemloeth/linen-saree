"use client";

import { useState } from "react";

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-pine-950/10 border-y border-pine-950/10">
      {items.map((item, i) => {
        const open = i === openIndex;
        return (
          <div key={item.label}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? -1 : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 py-3 text-left"
              >
                <span className="font-inter text-[13px] font-semibold text-pine-950">{item.label}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                  className={`shrink-0 text-pine-900 transition-transform ${open ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </h3>
            {open ? (
              <p className="pb-3 text-[13px] leading-relaxed text-muted">{item.content}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}