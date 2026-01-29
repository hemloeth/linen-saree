"use client"

import { StarRating } from "@/components/star-rating"
import { getReviewsByProduct, getAverageRating, getTotalReviews } from "@/lib/reviews"

interface SimpleReviewsProps {
  productId: string
}

export function SimpleReviews({ productId }: SimpleReviewsProps) {
  const reviews = getReviewsByProduct(productId)
  const averageRating = getAverageRating(productId)
  const totalReviews = getTotalReviews(productId)

  if (reviews.length === 0) {
    return (
      <div className="py-8">
        <h3 className="text-lg font-medium mb-4">Customer Reviews</h3>
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Customer Reviews</h3>
        <div className="flex items-center gap-3">
          <StarRating rating={averageRating} size="md" />
          <span className="text-lg font-medium">{averageRating}</span>
          <span className="text-muted-foreground">({totalReviews} reviews)</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-border pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-medium">{review.userName}</span>
                <StarRating rating={review.rating} />
              </div>
              <span className="text-sm text-muted-foreground">{review.date}</span>
            </div>
            <p className="text-muted-foreground">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}