"use client"

import { useState } from "react"
import { Upload, X, Play, Image as ImageIcon } from "lucide-react"
import { StarRating } from "@/components/star-rating"
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
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [videos, setVideos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setImages(prev => [...prev, ...imageFiles].slice(0, 5)) // Limit to 5 images
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const videoFiles = files.filter(file => file.type.startsWith('video/'))
    setVideos(prev => [...prev, ...videoFiles].slice(0, 2)) // Limit to 2 videos
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index))
  }

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
      const reviewData = {
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        images,
        videos
      }

      // In a real app, this would upload files and submit to API
      console.log('Review submitted:', reviewData)
      
      if (onSubmit) {
        onSubmit(reviewData)
      }

      // Reset form
      setRating(0)
      setTitle("")
      setComment("")
      setUserName("")
      setUserEmail("")
      setImages([])
      setVideos([])
      
      alert('Review submitted successfully!')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error submitting review. Please try again.')
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

        {/* User Info */}
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="userEmail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="Give your review a title"
            maxLength={100}
            required
          />
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

        {/* Media Upload */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Add Photos (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-md cursor-pointer hover:bg-muted transition-colors text-sm">
                <ImageIcon className="w-4 h-4" />
                <span>Upload Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Max 5 images, up to 5MB each
              </p>
            </div>
            
            {/* Image Previews */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-md border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Add Videos (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-md cursor-pointer hover:bg-muted transition-colors text-sm">
                <Play className="w-4 h-4" />
                <span>Upload Videos</span>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Max 2 videos, up to 50MB each
              </p>
            </div>
            
            {/* Video Previews */}
            {videos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {videos.map((video, index) => (
                  <div key={index} className="relative">
                    <video
                      src={URL.createObjectURL(video)}
                      className="w-16 h-16 object-cover rounded-md border border-border"
                      muted
                    />
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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