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
  const [photos, setPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    if (!comment.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const { apiUpload } = await import("@/lib/api")
      
      const formData = new FormData()
      formData.append('rating', String(rating))
      if (title.trim()) formData.append('title', title.trim())
      formData.append('comment', comment.trim())
      
      if (photos.length > 0) {
        photos.forEach(photo => {
          formData.append('photos', photo)
        })
      }
      
      await apiUpload(`/api/review/product/${productId}`, formData)

      if (onSubmit) {
        const payload = {
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }
        onSubmit(payload)
      }

      // Reset form
      setRating(0)
      setTitle("")
      setComment("")
      setPhotos([])

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

        {/* Photos */}
        <div>
          <label htmlFor="photos" className="block text-sm font-medium mb-1">
            Add Photos (up to 5)
          </label>
          <input
            type="file"
            id="photos"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                const selectedFiles = Array.from(e.target.files).slice(0, 5)
                setPhotos(selectedFiles)
              }
            }}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {photos.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {photos.map((photo, i) => (
                 <div key={i} className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[150px]">
                   {photo.name}
                 </div>
              ))}
            </div>
          )}
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