"use client"

import { useState } from "react"
import { StarRating } from "@/components/common/star-rating"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WriteReviewFormProps {
  productId: string
  productName: string
  onSubmit?: (reviewData: any) => void
  onCancel?: () => void
  className?: string
}

export function WriteReviewForm({
  productId,
  productName,
  onSubmit,
  onCancel,
  className
}: WriteReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    if (!title.trim() || !comment.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const { apiPost } = await import("@/lib/api")

      const payload = {
        rating,
        title: title.trim(),
        comment: comment.trim(),
      }

      await apiPost(`/api/review/product/${productId}`, payload)

      if (onSubmit) {
        onSubmit(payload)
      }

      // Reset form
      setRating(0)
      setTitle("")
      setComment("")

      alert('Review submitted successfully!')
    } catch (error: any) {
      console.error('Error submitting review:', error)
      alert(error.message || 'Error submitting review. Please make sure you are logged in and haven\'t already reviewed this product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4", className)}>
      <h3 className="text-lg font-medium mb-4">Write a Review</h3>
      <p className="text-muted-foreground mb-4 text-sm">
        Share your experience with <span className="font-medium">{productName}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <StarRating
            rating={rating}
            interactive
            onRatingChange={setRating}
            size="md"
            className="mb-1"
          />
          <p className="text-xs text-muted-foreground">
            Click on the stars to rate this product
          </p>
        </div>

        {/* Review Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-1">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical text-sm"
            placeholder="Share your experience with this product..."
            maxLength={1000}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            {comment.length}/1000 characters
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex-1"
            size="sm"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              size="sm"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}