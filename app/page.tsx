import { Header } from "@/components/header"
import { VideoHero } from "@/components/video-hero"
import { NewCollections } from "@/components/new-collections"
import { CategoryGrid } from "@/components/category-grid"
import { FeaturedBanner } from "@/components/featured-banner"
import { CelebritySection } from "@/components/celebrity-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <VideoHero />
      <NewCollections />
      <CategoryGrid />
      <FeaturedBanner />
      <CelebritySection />
      <NewsletterSection />
      <Footer />
      <CartSidebar />
    </main>
  )
}
