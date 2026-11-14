"use client";

import Image from "next/image";

export default function ColorSwatches({ swatches, value, onChange }) {
  if (!swatches.length) return null;
  const selected = swatches.find((s) => s.id === value) ?? swatches[0];

  return (
    <div>
      <p className="font-inter text-[12px] font-semibold text-pine-950">
        Color: <span className="font-normal text-muted">{selected.name}</span>
      </p>
      <div className="mt-2 flex gap-2.5" role="radiogroup" aria-label="Colour">
        {swatches.map((swatch) => (
          <button
            key={swatch.id}
            type="button"
            role="radio"
            aria-checked={swatch.id === value}
            aria-label={swatch.name}
            onClick={() => onChange(swatch.id)}
            className={`relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-offset-2 transition ${
              swatch.id === value ? "ring-pine-900" : "ring-transparent hover:ring-pine-900/40"
            }`}
          >
            <Image src={swatch.image} alt="" fill sizes="56px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}