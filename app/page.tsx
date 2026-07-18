import { Header } from "@/components/layout/header"
import { AutoScrollHero } from "@/components/sections/auto-scroll-hero"
import { NewCollections } from "@/components/sections/new-collections"
import { CategoryGrid } from "@/components/sections/category-grid"
import { CollectionBanners } from "@/components/sections/collection-banners"
import { VideoSection } from "@/components/sections/video-section"
import { FeaturedBanner } from "@/components/sections/featured-banner"
import { TrustSection } from "@/components/sections/trust-section"
import { NewsletterSection } from "@/components/sections/newsletter-section"
import { Footer } from "@/components/layout/footer"
import { apiServerGet } from "@/lib/api"

export default async function Home() {
  let heroSlides = [];
  try {
    const data = await apiServerGet('/api/hero', { cache: 'no-store' });
    if (data && data.slides) {
      heroSlides = data.slides;
    }
  } catch (error) {
    console.error("Failed to fetch hero slides on server:", error);
  }

  return (
    <main className="min-h-screen">
      <Header />
      <AutoScrollHero initialSlides={heroSlides} />
      <div>
        <NewCollections />
        <CategoryGrid />
        <CollectionBanners />
        <VideoSection />
        <FeaturedBanner />

        <NewsletterSection />
        <TrustSection />
        <Footer />
      </div>
    </main>
  )
}
