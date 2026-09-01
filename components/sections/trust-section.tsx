import { TrustBadges } from "@/components/common/trust-badges"

interface TrustSectionProps {
  className?: string
  title?: string
  subtitle?: string
}

export function TrustSection({ 
  className = "",
  title = "The Handloomer Promise",
  subtitle = "Direct from master weavers with complete peace of mind"
}: TrustSectionProps) {
  return (
    <section className={`py-12 md:py-16 bg-stone-50/80 dark:bg-stone-900/40 border-t border-b border-border/40 ${className}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-[11px] uppercase tracking-[0.25em] text-amber-700/80 dark:text-amber-400/80 font-medium">
            Our Quality Guarantee
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground mt-1">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-lg mx-auto">
            {subtitle}
          </p>
        </div>
        
        <TrustBadges 
          variant="grid" 
          showDescription={true}
          className="max-w-5xl mx-auto"
        />
      </div>
    </section>
  )
}

