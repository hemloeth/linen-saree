"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Filter, Star } from "lucide-react"
import { ReviewSummary } from "@/components/reviews/review-summary"
import { ReviewCard } from "@/components/reviews/review-card"
import { WriteReviewForm } from "@/components/reviews/write-review-form"
import { Button } from "@/components/ui/button"
import { getReviewStats, type Review } from "@/lib/reviews"
import { apiGet } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ProductReviewsProps {
  productId: string
  productName: string
  className?: string
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
type FilterOption = 'all' | '5' | '4' | '3' | '2' | '1' | 'with-media'

export function ProductReviews({ productId, productName, className }: ProductReviewsProps) {
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const res = await apiGet(`/api/review/product/${productId}?limit=100`)
      if (res.success) {
        setAllReviews(res.reviews)
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const stats = getReviewStats(allReviews)

  // Filter reviews
  const filteredReviews = allReviews.filter(review => {
    if (filterBy === 'all') return true
    if (filterBy === 'with-media') return false // Media not supported yet in backend
    return review.rating === parseInt(filterBy)
  })

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      case 'helpful':
        return 0 // Removed helpful count for now
      default:
        return 0
    }
  })

  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 5)
  const hasMoreReviews = sortedReviews.length > 5

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' },
    { value: 'helpful', label: 'Most Helpful' }
  ]

  const filterOptions = [
    { value: 'all', label: 'All Reviews' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
    { value: 'with-media', label: 'With Photos/Videos' }
  ]

  return (
    <section className={cn("py-4 sm:py-8 lg:py-16", className)}>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Review Summary */}
              <ReviewSummary productId={productId} reviews={allReviews} />

              {/* Write Review Button */}
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowWriteReview(!showWriteReview)}
                  size="sm"
                  variant={showWriteReview ? "outline" : "default"}
                  className="px-4 py-2 text-sm"
                >
                  {showWriteReview ? "Cancel" : "Write Review"}
                </Button>
              </div>

              {/* Write Review Form */}
              {showWriteReview && (
                <WriteReviewForm
                  productId={productId}
                  productName={productName}
                  onCancel={() => setShowWriteReview(false)}
                  onSubmit={() => {
                    setShowWriteReview(false);
                    fetchReviews(); // Refresh after submit
                  }}
                />
              )}

              {/* Reviews Section */}
              {stats.totalReviews > 0 && (
                <div className="space-y-6">
                  {/* Filters and Sort */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <h3 className="text-lg sm:text-xl font-medium">
                      Reviews ({filteredReviews.length})
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Filter Dropdown */}
                      <div className="relative">
                        <select
                          value={filterBy}
                          onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                          className="appearance-none bg-background border border-border rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          {filterOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>

                      {/* Sort Dropdown */}
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="appearance-none bg-background border border-border rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {filteredReviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews match your current filter.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {displayedReviews.map((review) => (
                        <ReviewCard key={review._id} review={review} />
                      ))}

                      {/* Load More Button */}
                      {hasMoreReviews && !showAllReviews && (
                        <div className="text-center">
                          <Button
                            variant="outline"
                            onClick={() => setShowAllReviews(true)}
                          >
                            Show All Reviews ({sortedReviews.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
