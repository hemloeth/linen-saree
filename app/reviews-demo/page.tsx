import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductReviews } from "@/components/product-reviews"
import { StarRating } from "@/components/star-rating"
import { getProductBySlug } from "@/lib/products"
import { getReviewStats } from "@/lib/reviews"

export default function ReviewsDemoPage() {
  // Get a sample product for demonstration
  const sampleProduct = getProductBySlug("brown-pure-linen-saree")
  const reviewStats = getReviewStats("1")

  if (!sampleProduct) {
    return <div>Product not found</div>
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-[96px] lg:pt-[104px]">
        <section className="py-16 px-4 lg:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl lg:text-5xl mb-4">
                Product Reviews & Ratings Demo
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Experience our comprehensive review system with image and video support
              </p>
              
              {/* Star Rating Examples */}
              <div className="bg-card border border-border rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-medium mb-6">Star Rating Component</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-4">Small Size</h3>
                    <StarRating rating={4.5} size="sm" showRating />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-4">Medium Size</h3>
                    <StarRating rating={4.5} size="md" showRating />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-4">Large Size</h3>
                    <StarRating rating={4.5} size="lg" showRating />
                  </div>
                </div>
              </div>

              {/* Review Stats */}
              <div className="bg-card border border-border rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-medium mb-6">Review Statistics</h2>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {reviewStats.averageRating.toFixed(1)}
                    </div>
                    <StarRating rating={reviewStats.averageRating} size="md" className="justify-center mb-2" />
                    <p className="text-muted-foreground">Average Rating</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {reviewStats.totalReviews}
                    </div>
                    <p className="text-muted-foreground">Total Reviews</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {reviewStats.ratingDistribution[5]}
                    </div>
                    <p className="text-muted-foreground">5-Star Reviews</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Reviews Section */}
            <ProductReviews 
              productId={sampleProduct.id} 
              productName={sampleProduct.name} 
            />
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}