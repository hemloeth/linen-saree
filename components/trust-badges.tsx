import { Truck, RotateCcw } from "lucide-react"

// Custom SVG Icons for trust badges
const CODIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
    <path d="M8 7h8"/>
    <path d="M8 11h8"/>
  </svg>
)

const SecurePaymentIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    <circle cx="12" cy="16" r="1"/>
  </svg>
)

const trustBadges = [
  {
    icon: CODIcon,
    title: "COD Available",
    description: "Cash on Delivery"
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7 Days Return Policy"
  },
  {
    icon: SecurePaymentIcon,
    title: "Secure Payment",
    description: "100% Safe & Secure"
  },
  {
    icon: Truck,
    title: "Free Shipping",
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
  variant = "horizontal", 
  showDescription = true, 
  className = "",
  iconSize = "md"
}: TrustBadgesProps) {
  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  const containerClasses = {
    horizontal: "flex items-center justify-center gap-6 lg:gap-8",
    vertical: "flex flex-col gap-4",
    grid: "grid grid-cols-2 lg:grid-cols-4 gap-4"
  }

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {trustBadges.map((badge, index) => (
        <div 
          key={index}
          className="flex items-center gap-2 text-center lg:text-left"
        >
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full">
            <badge.icon className={`${iconSizeClasses[iconSize]} text-primary`} />
          </div>
          {showDescription && (
            <div className="text-left">
              <div className="text-sm font-medium text-foreground">
                {badge.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {badge.description}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Compact version for header/footer
export function TrustBadgesCompact({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 md:gap-6 ${className}`}>
      {trustBadges.map((badge, index) => (
        <div 
          key={index}
          className="flex items-center gap-1 md:gap-1.5 text-xs hover:opacity-100 transition-opacity"
          title={`${badge.title} - ${badge.description}`}
        >
          <badge.icon className="w-3 h-3 md:w-4 md:h-4" />
          <span className="hidden sm:inline md:hidden xl:inline font-medium">{badge.title}</span>
        </div>
      ))}
    </div>
  )
}