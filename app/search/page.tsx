"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { searchProducts } from "@/lib/products"
import { SearchResults } from "@/components/search-results"
import { PageHeroSlider } from "@/components/page-hero-slider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"
import { Search } from "lucide-react"

const searchSlides = [
  {
    id: "search-main",
    image: "/images/hero-saree.jpg",
    title: "Find Your Perfect Saree",
    subtitle: "Search through our curated collection of premium linen sarees"
  },
  {
    id: "search-variety",
    image: "/images/celebrity-look.jpg",
    title: "Endless Variety",
    subtitle: "From casual to festive, discover sarees for every occasion"
  },
  {
    id: "search-quality",
    image: "/images/handloom-saree.jpg",
    title: "Premium Quality",
    subtitle: "Handcrafted sarees with attention to every detail"
  },
  {
    id: "search-colors",
    image: "/images/designer-saree.jpg",
    title: "Vibrant Colors",
    subtitle: "Explore our rainbow of colors and patterns"
  }
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState(searchProducts(query))

  useEffect(() => {
    const searchQuery = searchParams.get('q') || ''
    setQuery(searchQuery)
    setResults(searchProducts(searchQuery))
    
    // Update page title
    if (searchQuery) {
      document.title = `Search: ${searchQuery} - Linen Sarees`
    } else {
      document.title = 'Search Products - Linen Sarees'
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newResults = searchProducts(query)
    setResults(newResults)
    
    // Update URL without page reload
    const url = new URL(window.location.href)
    if (query.trim()) {
      url.searchParams.set('q', query)
    } else {
      url.searchParams.delete('q')
    }
    window.history.pushState({}, '', url.toString())
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setResults(searchProducts(suggestion))
    
    // Update URL
    const url = new URL(window.location.href)
    url.searchParams.set('q', suggestion)
    window.history.pushState({}, '', url.toString())
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section with Auto-Scroll */}
      <div className="mt-[104px]">
        <PageHeroSlider slides={searchSlides} height="30vh" />
      </div>
      {/* Main Content */}
      <div className="bg-background py-16">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, color, fabric, or category..."
                className="w-full px-6 py-4 text-lg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Search Results Count */}
          <div className="mb-8">
            {query && (
              <p className="text-muted-foreground text-center">
                {results.length > 0 
                  ? `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
                  : `No results found for "${query}"`
                }
              </p>
            )}
          </div>

          {/* Results */}
          <SearchResults 
            products={results} 
            query={query} 
            onSuggestionClick={handleSuggestionClick}
          />
        </div>
      </div>

      <Footer />
      <CartSidebar />
    </main>
  )
}