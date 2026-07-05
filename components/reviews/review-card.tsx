"use client"

import { useState } from "react"
import Image from "next/image"
import { ThumbsUp, Play, ShieldCheck } from "lucide-react"
import { StarRating } from "@/components/common/star-rating"
import { Button } from "@/components/ui/button"
import { formatReviewDate, type Review } from "@/lib/reviews"
import { cn } from "@/lib/utils"

interface ReviewCardProps {
  review: Review
  className?: string
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  // helpful count or verification disabled for MVP
  const userName = review.user?.name || "Anonymous"

  return (
    <>
      <div className={cn("border border-border rounded-lg p-6 bg-card", className)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">{userName}</h4>
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

        <p className="text-muted-foreground leading-relaxed">
          {review.comment}
        </p>

        {/* Photos */}
        {review.photos && review.photos.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {review.photos.map((photoUrl, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden border border-border">
                <Image
                  src={photoUrl}
                  alt={`Review photo ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  )
}