"use client";

import { useEffect, useRef, useState } from "react";

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

function remainingParts(target) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function endOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
}

export default function CountdownTimer({ endsAt }) {
  const [parts, setParts] = useState(null);
  const targetRef = useRef(null);

  useEffect(() => {
    targetRef.current = endsAt ? new Date(endsAt).getTime() : endOfMonth();
    const tick = () => setParts(remainingParts(targetRef.current));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [endsAt]);

  return (
    <div className="flex items-end gap-1.5" role="timer" aria-label="Offer ends in">
      {UNITS.map((unit, i) => (
        <div key={unit.key} className="flex items-end gap-1.5">
          <div className="flex flex-col items-center">
            <span className="flex h-9 min-w-9 items-center justify-center rounded bg-pine-950 px-1.5 font-inter text-sm font-semibold tabular-nums text-white">
              {parts ? String(parts[unit.key]).padStart(2, "0") : "--"}
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-wide text-muted">{unit.label}</span>
          </div>
          {i < UNITS.length - 1 ? (
            <span className="pb-4 text-sm font-semibold text-pine-950">:</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}