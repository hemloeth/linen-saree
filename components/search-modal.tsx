"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { searchProducts } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { cn } from "@/lib/utils"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(searchProducts(''))
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (query.trim()) {
      setIsLoading(true)
      // Add a small delay to show loading state
      const timeoutId = setTimeout(() => {
        setResults(searchProducts(query))
        setIsLoading(false)
      }, 150)
      
      return () => clearTimeout(timeoutId)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }, [query])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      onClose()
    }
  }

  const handleProductClick = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-0 top-0 bg-background border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          {/* Search Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Search Products</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, color, fabric, or category..."
                className="w-full px-6 py-3 text-base border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Results */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Searching...</p>
            </div>
          )}
          
          {!isLoading && results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-4">
                Showing {Math.min(results.length, 8)} of {results.length} results
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.slice(0, 8).map((product) => (
                  <div key={product.id} onClick={handleProductClick}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {results.length > 8 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query)}`)
                      onClose()
                    }}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                  >
                    View all {results.length} results
                  </button>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No products found for "{query}"</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-sm text-muted-foreground">Try:</span>
                {['Pure Linen', 'Banarasi', 'Handloom', 'Blue', 'Pink'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {!isLoading && !query && (
            <div className="py-8">
              <p className="text-sm text-muted-foreground mb-4">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {['Pure Linen', 'Banarasi Silk', 'Handloom', 'Embroidery', 'Blue Saree', 'Pink Saree', 'Bridal', 'Festive'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-full transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}