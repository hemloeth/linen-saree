export default function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-center gap-3">
        <span aria-hidden="true" className="h-px w-10 bg-pine-950/70 sm:w-16" />
        <h2 className="text-center font-display text-lg font-medium uppercase tracking-[0.14em] text-pine-950 sm:text-xl">
          {title}
        </h2>
        <span aria-hidden="true" className="h-px w-10 bg-pine-950/70 sm:w-16" />
      </div>
      {subtitle ? (
        <p className="mt-1 text-center text-xs text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
