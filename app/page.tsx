import { Header } from "@/components/header"
import { AutoScrollHero } from "@/components/auto-scroll-hero"
import { NewCollections } from "@/components/new-collections"
import { CategoryGrid } from "@/components/category-grid"
import { CollectionBanners } from "@/components/collection-banners"
import { VideoSection } from "@/components/video-section"
import { FeaturedBanner } from "@/components/featured-banner"
import { CelebritySection } from "@/components/celebrity-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-[96px] lg:pt-[104px]">
        <AutoScrollHero />
        <NewCollections />
        <CategoryGrid />
        <CollectionBanners />
        <VideoSection />
        <FeaturedBanner />
        <CelebritySection />
        <NewsletterSection />
        <Footer />
      </div>
    </main>
  )
}
