"use client"

import { StarRating } from "@/components/star-rating"
import { getReviewStats, type ReviewStats } from "@/lib/reviews"
import { cn } from "@/lib/utils"

interface ReviewSummaryProps {
  productId: string
  className?: string
}

export function ReviewSummary({ productId, className }: ReviewSummaryProps) {
  const stats = getReviewStats(productId)

  if (stats.totalReviews === 0) {
    return (
      <div className={cn("bg-card border border-border rounded-lg p-6", className)}>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground">Be the first to review this product!</p>
        </div>
      </div>
    )
  }

  const getPercentage = (count: number) => {
    return stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0
  }

  return (
    <div className={cn("bg-card border border-border rounded-lg p-6", className)}>
      <h3 className="text-lg font-medium mb-6">Customer Reviews</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          <StarRating rating={stats.averageRating} size="lg" className="justify-center mb-2" />
          <p className="text-muted-foreground">
            Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating as keyof ReviewStats['ratingDistribution']]
            const percentage = getPercentage(count)
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{rating}</span>
                  <StarRating rating={1} maxRating={1} size="sm" />
                </div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground w-12 text-right">
                  {count}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}