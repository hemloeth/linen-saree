"use client"

import { useState } from "react"
import Image from "next/image"
import { ThumbsUp, Play, ShieldCheck } from "lucide-react"
import { StarRating } from "@/components/star-rating"
import { Button } from "@/components/ui/button"
import { formatReviewDate, type Review } from "@/lib/reviews"
import { cn } from "@/lib/utils"

interface ReviewCardProps {
  review: Review
  className?: string
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false)
  const [showAllImages, setShowAllImages] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', src: string } | null>(null)

  const handleHelpfulClick = () => {
    setIsHelpful(!isHelpful)
    // In a real app, this would make an API call to update the helpful count
  }

  const displayImages = showAllImages ? review.images : review.images?.slice(0, 3)
  const hasMoreImages = review.images && review.images.length > 3

  return (
    <>
      <div className={cn("border border-border rounded-lg p-6 bg-card", className)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-sm">
                {review.userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">{review.userName}</h4>
                {review.isVerifiedPurchase && (
                  <div className="flex items-center gap-1 text-green-600">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs">Verified Purchase</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatReviewDate(review.createdAt)}
              </p>
            </div>
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>

        {/* Review Title */}
        {review.title && (
          <h5 className="font-medium text-foreground mb-2">{review.title}</h5>
        )}

        {/* Review Comment */}
        <p className="text-muted-foreground leading-relaxed mb-4">
          {review.comment}
        </p>

        {/* Review Media */}
        {(review.images?.length || review.videos?.length) && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {/* Images */}
              {displayImages?.map((image, index) => (
                <button
                  key={`image-${index}`}
                  onClick={() => setSelectedMedia({ type: 'image', src: image })}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Review image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}

              {/* Videos */}
              {review.videos?.map((video, index) => (
                <button
                  key={`video-${index}`}
                  onClick={() => setSelectedMedia({ type: 'video', src: video })}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity bg-black"
                >
                  <video
                    src={video}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </button>
              ))}

              {/* Show more images button */}
              {hasMoreImages && !showAllImages && (
                <button
                  onClick={() => setShowAllImages(true)}
                  className="w-20 h-20 rounded-lg border border-border bg-muted flex items-center justify-center text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  +{(review.images?.length || 0) - 3}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Helpful Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpfulClick}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              isHelpful && "text-primary"
            )}
          >
            <ThumbsUp className={cn("w-4 h-4 mr-2", isHelpful && "fill-current")} />
            Helpful ({review.helpfulCount + (isHelpful ? 1 : 0)})
          </Button>
        </div>
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl font-bold z-10"
            >
              ✕
            </button>
            {selectedMedia.type === 'image' ? (
              <div className="relative w-full h-full">
                <Image
                  src={selectedMedia.src || "/placeholder.svg"}
                  alt="Review image"
                  width={800}
                  height={600}
                  className="object-contain w-full h-full"
                />
              </div>
            ) : (
              <video
                src={selectedMedia.src}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}