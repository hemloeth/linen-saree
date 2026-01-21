import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { PageHeroSlider } from "@/components/page-hero-slider"
import { products, categories, getProductsByCategory } from "@/lib/products"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

// Define different slide sets for different collection types
const getCollectionSlides = (slug: string, category: any) => {
  const baseSlides = [
    {
      id: `${slug}-main`,
      image: category?.image || "/images/hero-saree.jpg",
      title: category?.name || "Collection",
      subtitle: category?.description || ""
    }
  ]

  // Add specific slides based on collection type
  switch (slug) {
    case "pure-linen":
      return [
        ...baseSlides,
        {
          id: "linen-designer",
          image: "/images/designer-saree.jpg",
          title: "Pure Linen Collection",
          subtitle: "Breathable comfort meets timeless elegance"
        },
        {
          id: "linen-casual",
          image: "/images/casual-saree.jpg",
          title: "Everyday Elegance",
          subtitle: "Natural comfort for daily sophistication"
        },
        {
          id: "linen-celebrity",
          image: "/images/celebrity-look.jpg",
          title: "Contemporary Style",
          subtitle: "Modern designs with traditional charm"
        }
      ]
    
    case "handloom":
      return [
        ...baseSlides,
        {
          id: "handloom-green",
          image: "/images/products/handloom-green.jpg",
          title: "Handloom Heritage",
          subtitle: "Traditional weaving techniques passed down generations"
        },
        {
          id: "handloom-rust",
          image: "/images/products/handloom-rust.jpg",
          title: "Artisan Crafted",
          subtitle: "Each piece tells a story of skilled craftsmanship"
        }
      ]
    
    case "banarasi-silk":
      return [
        ...baseSlides,
        {
          id: "banarasi-red",
          image: "/images/products/banarasi-red.jpg",
          title: "Banarasi Silk",
          subtitle: "Luxurious silk with intricate gold zari work"
        },
        {
          id: "banarasi-pink",
          image: "/images/products/banarasi-pink.jpg",
          title: "Royal Elegance",
          subtitle: "Perfect for weddings and grand celebrations"
        }
      ]
    
    case "silk-linen":
      return [
        ...baseSlides,
        {
          id: "silk-cream",
          image: "/images/products/silk-cream.jpg",
          title: "Silk Linen Collection",
          subtitle: "Lustrous silk blend for special occasions"
        },
        {
          id: "silk-navy",
          image: "/images/products/silk-navy.jpg",
          title: "Classic Sophistication",
          subtitle: "Timeless colors for elegant styling"
        }
      ]
    
    case "embroidery":
      return [
        ...baseSlides,
        {
          id: "embroidery-maroon",
          image: "/images/products/embroidery-maroon.jpg",
          title: "Embroidered Elegance",
          subtitle: "Intricate embroidery work on premium fabrics"
        },
        {
          id: "embroidery-detail",
          image: "/images/designer-saree.jpg",
          title: "Artisan Details",
          subtitle: "Hand-embroidered motifs and patterns"
        }
      ]
    
    case "kota-linen":
      return [
        ...baseSlides,
        {
          id: "kota-orange",
          image: "/images/products/kota-orange.jpg",
          title: "Kota Linen Collection",
          subtitle: "Lightweight and airy for summer comfort"
        },
        {
          id: "kota-casual",
          image: "/images/casual-saree.jpg",
          title: "Summer Essentials",
          subtitle: "Perfect for warm weather styling"
        }
      ]
    
    case "cotton-linen":
      return [
        ...baseSlides,
        {
          id: "cotton-white",
          image: "/images/products/cotton-white.jpg",
          title: "Cotton Linen Blend",
          subtitle: "Comfortable and breathable for daily wear"
        },
        {
          id: "cotton-casual",
          image: "/images/casual-saree.jpg",
          title: "Everyday Comfort",
          subtitle: "Soft textures for all-day comfort"
        }
      ]
    
    case "new-arrivals":
      return [
        {
          id: "new-arrivals-main",
          image: "/images/celebrity-look.jpg",
          title: "New Arrivals",
          subtitle: "Discover our latest collection of handcrafted linen sarees"
        },
        {
          id: "new-designer",
          image: "/images/designer-saree.jpg",
          title: "Fresh Designs",
          subtitle: "Contemporary patterns with traditional charm"
        },
        {
          id: "new-casual",
          image: "/images/casual-saree.jpg",
          title: "Modern Comfort",
          subtitle: "Beautiful new styles for everyday elegance"
        }
      ]
    
    case "sale":
      return [
        {
          id: "sale-main",
          image: "/images/celebrity-look.jpg",
          title: "Sale Collection",
          subtitle: "Exclusive discounts on premium linen sarees"
        },
        {
          id: "sale-designer",
          image: "/images/designer-saree.jpg",
          title: "Designer Sale",
          subtitle: "Luxury sarees at unbeatable prices"
        },
        {
          id: "sale-festive",
          image: "/images/festive-saree.jpg",
          title: "Festive Deals",
          subtitle: "Premium celebration wear on special offer"
        }
      ]
    
    default:
      return baseSlides
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const category = categories.find(c => c.slug === slug)
  
  if (!category) {
    return {
      title: "Collection Not Found | Linen Sarees"
    }
  }

  return {
    title: `${category.name} Sarees | Linen Sarees`,
    description: category.description
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  
  // Handle special slugs
  let categoryProducts = getProductsByCategory(slug)
  let category = categories.find(c => c.slug === slug)
  let pageTitle = category?.name || "Collection"
  let pageDescription = category?.description || ""

  // Special cases
  if (slug === "new-arrivals") {
    categoryProducts = products.filter(p => p.isNew)
    pageTitle = "New Arrivals"
    pageDescription = "Discover our latest collection of handcrafted linen sarees"
  } else if (slug === "sale") {
    categoryProducts = products.filter(p => p.isOnSale)
    pageTitle = "Sale"
    pageDescription = "Exclusive discounts on premium linen sarees"
  }

  if (!category && slug !== "new-arrivals" && slug !== "sale") {
    notFound()
  }

  // Get slides for this collection
  const collectionSlides = getCollectionSlides(slug, category)

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    { label: pageTitle }
  ]

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Banner with Auto-Scroll */}
      <div className="mt-[96px] lg:mt-[104px]">
        <PageHeroSlider 
          slides={collectionSlides} 
          height="40vh" 
          breadcrumbs={breadcrumbs}
        />
      </div>

      {/* Categories Navigation */}
      <section className="py-6 px-4 lg:px-8 bg-secondary border-b border-border">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/collections"
              className="px-5 py-2 border border-border hover:bg-foreground hover:text-background text-sm tracking-wide transition-colors"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className={`px-5 py-2 text-sm tracking-wide transition-colors ${
                  cat.slug === slug
                    ? "bg-foreground text-background"
                    : "border border-border hover:bg-foreground hover:text-background"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <p className="text-muted-foreground">
              Showing {categoryProducts.length} products
            </p>
            <div className="flex items-center gap-4">
              <select className="border border-border px-4 py-2 bg-background text-sm">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>

          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">No products found in this collection</p>
              <Link href="/collections" className="text-primary hover:underline">
                Browse all collections
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

export async function generateStaticParams() {
  return [
    ...categories.map((category) => ({
      slug: category.slug,
    })),
    { slug: "new-arrivals" },
    { slug: "sale" },
  ]
}
