export interface Review {
  _id: string
  product: string
  user: {
    _id: string
    name: string
  }
  rating: number // 1-5 stars
  title: string
  comment: string
  photos?: string[]
  createdAt: string
  updatedAt: string
}

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export function getReviewStats(productReviews: Review[]): ReviewStats {
  if (!productReviews || productReviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    }
  }

  const totalReviews = productReviews.length
  const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = Math.round((totalRating / totalReviews) * 10) / 10

  const ratingDistribution = productReviews.reduce((dist, review) => {
    const r = review.rating as keyof typeof dist;
    if (dist[r] !== undefined) {
      dist[r]++;
    }
    return dist
  }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

  return {
    totalReviews,
    averageRating,
    ratingDistribution
  }
}

export function formatReviewDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}