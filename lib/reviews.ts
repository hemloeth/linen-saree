export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userEmail: string
  rating: number // 1-5 stars
  title: string
  comment: string
  images?: string[] // Review images
  videos?: string[] // Review videos
  isVerifiedPurchase: boolean
  helpfulCount: number
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

// Mock review data for demonstration
export const reviews: Review[] = [
  {
    id: "r1",
    productId: "1",
    userId: "u1",
    userName: "Priya Sharma",
    userEmail: "priya.s@email.com",
    rating: 5,
    title: "Absolutely Beautiful Saree!",
    comment: "This brown linen saree exceeded my expectations. The fabric quality is excellent, very soft and comfortable to wear. The gold zari border adds such elegance. Perfect for office wear and casual gatherings. Highly recommended!",
    images: ["/images/reviews/review-1-1.jpg", "/images/reviews/review-1-2.jpg"],
    videos: ["/videos/reviews/review-1.mp4"],
    isVerifiedPurchase: true,
    helpfulCount: 24,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "r2",
    productId: "1",
    userId: "u2",
    userName: "Anita Gupta",
    userEmail: "anita.g@email.com",
    rating: 4,
    title: "Good Quality, Fast Delivery",
    comment: "The saree is beautiful and the color is exactly as shown in the pictures. The linen fabric is breathable and perfect for summer. Only minor issue was some loose threads, but overall very satisfied with the purchase.",
    images: ["/images/reviews/review-2-1.jpg"],
    isVerifiedPurchase: true,
    helpfulCount: 18,
    createdAt: "2024-01-10T14:20:00Z",
    updatedAt: "2024-01-10T14:20:00Z"
  },
  {
    id: "r3",
    productId: "1",
    userId: "u3",
    userName: "Meera Patel",
    userEmail: "meera.p@email.com",
    rating: 5,
    title: "Perfect for Daily Wear",
    comment: "I've been wearing this saree regularly for the past month. It's so comfortable and easy to maintain. The brown color goes with everything. Great value for money!",
    isVerifiedPurchase: true,
    helpfulCount: 12,
    createdAt: "2024-01-05T09:15:00Z",
    updatedAt: "2024-01-05T09:15:00Z"
  },
  {
    id: "r4",
    productId: "2",
    userId: "u4",
    userName: "Kavya Reddy",
    userEmail: "kavya.r@email.com",
    rating: 5,
    title: "Stunning Royal Blue!",
    comment: "This royal blue saree is absolutely gorgeous! The silver border is so elegant and the fabric drapes beautifully. Got so many compliments when I wore it to a wedding. Will definitely order more colors!",
    images: ["/images/reviews/review-4-1.jpg", "/images/reviews/review-4-2.jpg", "/images/reviews/review-4-3.jpg"],
    videos: ["/videos/reviews/review-4.mp4"],
    isVerifiedPurchase: true,
    helpfulCount: 31,
    createdAt: "2024-01-20T16:45:00Z",
    updatedAt: "2024-01-20T16:45:00Z"
  },
  {
    id: "r5",
    productId: "2",
    userId: "u5",
    userName: "Deepika Singh",
    userEmail: "deepika.s@email.com",
    rating: 4,
    title: "Beautiful Color, Great Quality",
    comment: "Love the royal blue color and the linen fabric quality. The saree is well-made and the silver border adds a nice touch. Packaging was also very good. Recommended!",
    isVerifiedPurchase: true,
    helpfulCount: 15,
    createdAt: "2024-01-18T11:30:00Z",
    updatedAt: "2024-01-18T11:30:00Z"
  },
  {
    id: "r6",
    productId: "4",
    userId: "u6",
    userName: "Ritu Agarwal",
    userEmail: "ritu.a@email.com",
    rating: 5,
    title: "Perfect for Wedding Season!",
    comment: "This pink Banarasi saree is absolutely stunning! The gold brocade work is intricate and beautiful. Wore it to my cousin's wedding and received countless compliments. The quality is premium and worth every penny.",
    images: ["/images/reviews/review-6-1.jpg", "/images/reviews/review-6-2.jpg"],
    videos: ["/videos/reviews/review-6.mp4"],
    isVerifiedPurchase: true,
    helpfulCount: 42,
    createdAt: "2024-01-25T13:20:00Z",
    updatedAt: "2024-01-25T13:20:00Z"
  },
  {
    id: "r7",
    productId: "4",
    userId: "u7",
    userName: "Sunita Joshi",
    userEmail: "sunita.j@email.com",
    rating: 4,
    title: "Elegant and Traditional",
    comment: "Beautiful Banarasi saree with excellent craftsmanship. The pink color is vibrant and the gold work is detailed. Slightly heavy but that's expected for Banarasi sarees. Great for special occasions.",
    isVerifiedPurchase: true,
    helpfulCount: 19,
    createdAt: "2024-01-22T10:15:00Z",
    updatedAt: "2024-01-22T10:15:00Z"
  },
  {
    id: "r8",
    productId: "6",
    userId: "u8",
    userName: "Lakshmi Nair",
    userEmail: "lakshmi.n@email.com",
    rating: 5,
    title: "Handloom Excellence!",
    comment: "This emerald green handloom saree is a masterpiece! You can feel the artisan's skill in every thread. The temple border is beautifully woven and the cotton linen fabric is so comfortable. Supporting handloom artisans feels great too!",
    images: ["/images/reviews/review-8-1.jpg"],
    isVerifiedPurchase: true,
    helpfulCount: 28,
    createdAt: "2024-01-28T15:40:00Z",
    updatedAt: "2024-01-28T15:40:00Z"
  }
]

// Utility functions for reviews
export function getReviewsByProductId(productId: string): Review[] {
  return reviews.filter(review => review.productId === productId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getReviewStats(productId: string): ReviewStats {
  const productReviews = getReviewsByProductId(productId)
  
  if (productReviews.length === 0) {
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
    dist[review.rating as keyof typeof dist]++
    return dist
  }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

  return {
    totalReviews,
    averageRating,
    ratingDistribution
  }
}

export function getTopReviews(productId: string, limit: number = 3): Review[] {
  return getReviewsByProductId(productId)
    .sort((a, b) => b.helpfulCount - a.helpfulCount)
    .slice(0, limit)
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