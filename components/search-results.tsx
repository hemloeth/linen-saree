import { Product } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { Search } from "lucide-react"

interface SearchResultsProps {
  products: Product[]
  query: string
  onSuggestionClick?: (suggestion: string) => void
}

export function SearchResults({ products, query, onSuggestionClick }: SearchResultsProps) {
  const suggestions = ['Pure Linen', 'Banarasi', 'Handloom', 'Blue', 'Pink', 'Embroidery']

  if (products.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )
  }

  if (query) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
          <Search className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground mb-6">
          Try adjusting your search terms or browse our collections
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-sm text-muted-foreground">Try searching for:</span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSuggestionClick?.(suggestion)}
              className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return null
}