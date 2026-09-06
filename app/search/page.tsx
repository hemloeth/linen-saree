"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { FilterOptions, SortOption } from "@/lib/products"
import { useProducts } from "@/context/product-context"
import { SearchResults } from "@/components/search/search-results"
import { PageHeroSlider } from "@/components/sections/page-hero-slider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Search, X, Sparkles, SlidersHorizontal, ArrowLeft } from "lucide-react"

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

const POPULAR_TAGS = ['Pure Linen', 'Banarasi Silk', 'Handloom', 'Festive Saree', 'Golden Zari', 'Pink', 'Red', 'Organza']

function SearchContent() {
  const { searchProducts } = useProducts()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [results, setResults] = useState(() => searchProducts('', {}, 'featured'))

  useEffect(() => {
    const searchQuery = searchParams.get('q') || ''
    setQuery(searchQuery)
    setInputValue(searchQuery)
    const newResults = searchProducts(searchQuery, filters, sortBy)
    setResults(newResults)

    // Update page title
    if (searchQuery) {
      document.title = `Search: ${searchQuery} - The Handloomer`
    } else {
      document.title = 'Search Products - The Handloomer'
    }
  }, [searchParams, filters, sortBy, searchProducts])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    setQuery(trimmed)
    const newResults = searchProducts(trimmed, filters, sortBy)
    setResults(newResults)

    // Update URL
    const url = new URL(window.location.href)
    if (trimmed) {
      url.searchParams.set('q', trimmed)
    } else {
      url.searchParams.delete('q')
    }
    window.history.pushState({}, '', url.toString())
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setQuery(suggestion)
    const newResults = searchProducts(suggestion, filters, sortBy)
    setResults(newResults)

    // Update URL
    const url = new URL(window.location.href)
    url.searchParams.set('q', suggestion)
    window.history.pushState({}, '', url.toString())
  }

  const handleClearSearch = () => {
    setInputValue('')
    setQuery('')
    const newResults = searchProducts('', filters, sortBy)
    setResults(newResults)
    const url = new URL(window.location.href)
    url.searchParams.delete('q')
    window.history.pushState({}, '', url.toString())
  }

  const handleFiltersChange = (newFilters: FilterOptions, newSortBy: SortOption) => {
    setFilters(newFilters)
    setSortBy(newSortBy)
    const newResults = searchProducts(query, newFilters, newSortBy)
    setResults(newResults)
  }

  return (
    <>
      {/* Hero Section with Auto-Scroll if no query */}
      {!query && (
        <div className="mt-[96px] lg:mt-[104px]">
          <PageHeroSlider slides={searchSlides} height="30vh" />
        </div>
      )}

      {/* Main Content */}
      <div className={`bg-background py-10 lg:py-16 ${query ? 'mt-[96px] lg:mt-[104px]' : ''}`}>
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
          {/* Top Search Bar & Header */}
          <div className="max-w-3xl mx-auto mb-10 text-center">
            {query && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Collections</span>
                </Link>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-xs text-muted-foreground">Search Catalog</span>
              </div>
            )}

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-3 text-foreground">
              {query ? `Search Results` : `Search Collection`}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6">
              {query 
                ? `Showing results for “${query}” (${results.length} found)`
                : `Find your dream linen saree by color, weave, occasion, or style`
              }
            </p>

            {/* Interactive Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="relative shadow-sm rounded-full bg-card border border-border/80 hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1.5 flex items-center gap-2">
              <div className="pl-3.5 text-muted-foreground">
                <Search className="w-5 h-5 text-primary" />
              </div>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search by saree name, fabric, color, SKU..."
                className="flex-1 bg-transparent px-2 py-2 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />

              {inputValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs sm:text-sm font-bold tracking-wide rounded-full transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                Search
              </button>
            </form>

            {/* Popular Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Popular:
              </span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSuggestionClick(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                    query.toLowerCase() === tag.toLowerCase()
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/60 hover:bg-secondary text-foreground border-border"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Component */}
          <SearchResults
            products={results}
            query={query}
            onSuggestionClick={handleSuggestionClick}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      </div>
    </>
  )
}

export default function SearchPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <Suspense fallback={
        <div className="mt-[96px] lg:mt-[104px] min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading search results...</p>
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>

      <Footer />
    </main>
  )
}
