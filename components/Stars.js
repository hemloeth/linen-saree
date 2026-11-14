function Star({ fill }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={fill ? "#f9a000" : "none"} stroke="#f9a000" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9 2.9-6Z" />
    </svg>
  );
}

export default function Stars({ rating = 0, reviews, size = 12, className = "" }) {
  const rounded = Math.round(rating);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ width: size, height: size }} className="inline-flex">
            <Star fill={i < rounded} />
          </span>
        ))}
      </span>
      <span className="font-inter text-[11px] text-muted">
        {rating.toFixed(1)}
        {typeof reviews === "number" ? ` (${reviews})` : ""}
      </span>
    </div>
  );
}