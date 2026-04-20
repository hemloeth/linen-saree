"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  showRating?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showRating = false,
  interactive = false,
  onRatingChange,
  className
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1
          const isFilled = starRating <= rating
          const isHalfFilled = starRating - 0.5 <= rating && starRating > rating

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(starRating)}
              disabled={!interactive}
              className={cn(
                "relative focus:outline-none",
                interactive && "hover:scale-110 transition-all duration-200 cursor-pointer hover:drop-shadow-sm",
                !interactive && "cursor-default"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors duration-200",
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : isHalfFilled
                    ? "fill-yellow-400/50 text-yellow-400"
                    : interactive 
                    ? "fill-none text-gray-300 hover:text-yellow-300"
                    : "fill-none text-gray-300"
                )}
              />
            </button>
          )
        })}
      </div>
      {showRating && (
        <span className={cn("text-muted-foreground ml-1", textSizeClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}