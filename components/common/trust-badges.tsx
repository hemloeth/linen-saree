import { Truck, RotateCcw, ShieldCheck, Banknote } from "lucide-react"

const trustBadges = [
  {
    icon: Banknote,
    title: "COD Available",
    description: "Pay on delivery across India"
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7 days hassle-free exchange"
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    description: "Certified pure handloom linen"
  },
  {
    icon: Truck,
    title: "Free Express Shipping",
    description: "On orders above ₹999"
  }
]

interface TrustBadgesProps {
  variant?: "horizontal" | "vertical" | "grid"
  showDescription?: boolean
  className?: string
  iconSize?: "sm" | "md" | "lg"
}

export function TrustBadges({
  variant = "grid",
  showDescription = true,
  className = "",
}: TrustBadgesProps) {
  if (variant === "grid") {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 ${className}`}>
        {trustBadges.map((badge, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2.5 sm:gap-3.5 p-3.5 sm:p-4 rounded-xl bg-background/80 border border-border/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-border"
          >
            <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0 text-stone-800 dark:text-stone-200">
              <badge.icon className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
                {badge.title}
              </div>
              {showDescription && (
                <div className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                  {badge.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "vertical") {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {trustBadges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50"
          >
            <div className="w-8 h-8 rounded-md bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200 flex-shrink-0">
              <badge.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">{badge.title}</div>
              {showDescription && (
                <div className="text-[11px] text-muted-foreground">{badge.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-8 ${className}`}>
      {trustBadges.map((badge, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <badge.icon className="w-4 h-4 text-stone-700 dark:text-stone-300" />
          <span className="font-medium text-foreground">{badge.title}</span>
        </div>
      ))}
    </div>
  )
}

// Compact version for header/announcement bar
export function TrustBadgesCompact({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 md:gap-6 ${className}`}>
      {trustBadges.map((badge, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 text-xs text-foreground/80"
          title={`${badge.title} - ${badge.description}`}
        >
          <badge.icon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-medium">{badge.title}</span>
        </div>
      ))}
    </div>
  )
}

