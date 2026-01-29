import { TrustBadges } from "@/components/trust-badges"

interface TrustSectionProps {
  className?: string
  title?: string
  subtitle?: string
}

export function TrustSection({ 
  className = "",
  title = "Why Choose Linen Sarees?",
  subtitle = "Your satisfaction is our priority"
}: TrustSectionProps) {
  return (
    <section className={`py-12 lg:py-16 bg-muted/30 ${className}`}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-serif font-semibold mb-2">
            {title}
          </h2>
          <p className="text-muted-foreground">
            {subtitle}
          </p>
        </div>
        
        <TrustBadges 
          variant="grid" 
          showDescription={true}
          iconSize="lg"
          className="max-w-4xl mx-auto"
        />
      </div>
    </section>
  )
}