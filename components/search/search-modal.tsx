"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, X, ArrowRight, Sparkles, Clock, Tag, ShoppingBag, ChevronRight, CornerDownLeft } from "lucide-react"
import { useProducts } from "@/context/product-context"
import { resolveMediaUrl } from "@/lib/media"
import { Product } from "@/lib/products"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const TRENDING_SEARCHES = [
  "Pure Linen",
  "Golden Zari",
  "Festive Saree",
  "Banarasi Silk",
  "Handloom",
  "Pink Saree",
  "Organza",
  "Temple Border"
]

const QUICK_CATEGORIES = [
  { name: "Pure Linen", href: "/categories/pure-linen" },
  { name: "Handloom", href: "/categories/handloom" },
  { name: "Festive Collection", href: "/collections/festive" },
  { name: "Best Sellers", href: "/best-sellers" },
  { name: "Video Collection", href: "/video-collection" }
]

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { mappedProducts, searchProducts } = useProducts()
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('handloomer_recent_searches')
        if (saved) {
          setRecentSearches(JSON.parse(saved).slice(0, 6))
        }
      }
    } catch {
      // Ignore localStorage error
    }
  }, [isOpen])

  // Save query to recent searches
  const saveRecentSearch = (term: string) => {
    const cleaned = term.trim()
    if (!cleaned) return
    try {
      const updated = [cleaned, ...recentSearches.filter(s => s.toLowerCase() !== cleaned.toLowerCase())].slice(0, 6)
      setRecentSearches(updated)
      localStorage.setItem('handloomer_recent_searches', JSON.stringify(updated))
    } catch {
      // Ignore
    }
  }

  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation()
    const updated = recentSearches.filter(s => s !== termToRemove)
    setRecentSearches(updated)
    try {
      localStorage.setItem('handloomer_recent_searches', JSON.stringify(updated))
    } catch {
      // Ignore
    }
  }

  const clearAllRecent = () => {
    setRecentSearches([])
    try {
      localStorage.removeItem('handloomer_recent_searches')
    } catch {
      // Ignore
    }
  }

  // Focus input automatically and lock background scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      setQuery('')
    }

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Real-time live filtered search results
  const liveResults = useMemo(() => {
    if (!query.trim()) return []
    return searchProducts(query.trim())
  }, [query, searchProducts])

  // Featured / Suggested items for empty state
  const featuredProducts = useMemo(() => {
    return mappedProducts.slice(0, 4)
  }, [mappedProducts])

  const handleFullSearch = (searchQuery: string) => {
    const term = searchQuery.trim()
    if (!term) return
    saveRecentSearch(term)
    onClose()
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      handleFullSearch(query)
    }
  }

  const handleProductSelect = (product: Product) => {
    saveRecentSearch(product.name)
    onClose()
    router.push(`/product/${product.slug}`)
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-start justify-center pt-8 sm:pt-14 md:pt-20 p-3 sm:p-4 md:p-6 lg:p-10 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto overscroll-contain"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-4xl bg-background border border-border/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-top-4 duration-300 relative overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Bar */}
        <form onSubmit={handleSubmit} className="relative border-b border-border bg-background/80 backdrop-blur-md p-4 sm:p-5 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by saree name, color, fabric, category, or SKU..."
              className="w-full bg-transparent text-base sm:text-lg font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none pr-10"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors shrink-0"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Enter key badge & submit button */}
          <button
            type="submit"
            disabled={!query.trim()}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              query.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            }`}
          >
            <span>Search</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors shrink-0 ml-1"
            aria-label="Close search modal"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6" style={{ scrollbarWidth: 'thin' }}>
          {/* STATE 1: User has typed a query */}
          {query.trim() ? (
            <div>
              {liveResults.length > 0 ? (
                <div className="space-y-4">
                  {/* Results Header Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                      <span>Found <strong className="text-foreground">{liveResults.length}</strong> matching sarees</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFullSearch(query)}
                      className="text-xs sm:text-sm text-primary font-bold hover:underline inline-flex items-center gap-1 group"
                    >
                      <span>View full results page</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {/* Top Matching Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {liveResults.slice(0, 6).map((product) => {
                      const discount = product.originalPrice && product.originalPrice > product.price
                        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        : 0
                      const imageUrl = product.image ? resolveMediaUrl(product.image) : (product.images?.[0] ? resolveMediaUrl(product.images[0]) : "/placeholder.svg")

                      return (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="group flex gap-3 p-2.5 rounded-xl border border-border/60 hover:border-primary/40 bg-card hover:bg-secondary/40 transition-all duration-200 cursor-pointer text-left"
                        >
                          <div className="relative w-18 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 80px, 100px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {discount > 0 && (
                              <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1 rounded">
                                {discount}% OFF
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {product.category || "Saree"}
                                </span>
                                {product.sku && (
                                  <span className="text-[10px] text-muted-foreground font-mono truncate">
                                    SKU: {product.sku}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                {product.name}
                              </h4>
                            </div>

                            <div className="flex items-baseline gap-1.5 mt-2">
                              <span className="text-xs sm:text-sm font-bold text-foreground">
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[10px] text-muted-foreground line-through">
                                  ₹{product.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* View All Matches Button */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleFullSearch(query)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary/95 text-primary-foreground text-xs sm:text-sm font-bold tracking-wide rounded-xl shadow-md transition-all group cursor-pointer"
                    >
                      <span>Press Enter or Click to View All {liveResults.length} Results</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                /* No Matches Found for Query */
                <div className="text-center py-10 px-4 space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">No matching sarees found for "{query}"</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                      Check for spelling mistakes, try more general terms, or explore our trending collections below.
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Try searching for:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {TRENDING_SEARCHES.slice(0, 5).map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setQuery(term)}
                          className="px-3 py-1.5 text-xs bg-secondary/80 hover:bg-secondary text-foreground rounded-full border border-border transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STATE 2: Query is Empty (Initial Clean State) */
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors font-medium cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => handleFullSearch(term)}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/70 hover:bg-secondary border border-border text-xs text-foreground font-medium transition-colors cursor-pointer"
                      >
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                          aria-label={`Remove ${term}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Categories Navigation */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Explore Collections</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {QUICK_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={onClose}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 hover:border-primary/50 bg-card hover:bg-secondary/50 text-xs font-medium text-foreground transition-all duration-200 group"
                    >
                      <span className="truncate">{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Featured Sarees Row */}
              {featuredProducts.length > 0 && (
                <div className="pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Featured In Catalog
                    </span>
                    <Link
                      href="/best-sellers"
                      onClick={onClose}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      View All Best Sellers →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {featuredProducts.map((product) => {
                      const imageUrl = product.image ? resolveMediaUrl(product.image) : (product.images?.[0] ? resolveMediaUrl(product.images[0]) : "/placeholder.svg")
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="group block cursor-pointer"
                        >
                          <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted mb-1.5 border border-border/40">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 50vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <h5 className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h5>
                          <span className="text-xs font-bold text-foreground">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Key Indicator */}
        <div className="border-t border-border bg-muted/40 px-4 py-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono shadow-xs">↵ Enter</kbd>
              <span>Full Search</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono shadow-xs">ESC</kbd>
              <span>Close</span>
            </span>
          </div>

          <span className="text-[11px] font-medium text-muted-foreground">
            The Handloomer • Premium Sarees
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}
