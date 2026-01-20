import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"
import { ProductCard } from "@/components/product-card"
import { products, categories, getProductsByCategory } from "@/lib/products"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
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
  let bannerImage = category?.image || "/images/hero-saree.jpg"

  // Special cases
  if (slug === "new-arrivals") {
    categoryProducts = products.filter(p => p.isNew)
    pageTitle = "New Arrivals"
    pageDescription = "Discover our latest collection of handcrafted linen sarees"
    bannerImage = "/images/designer-saree.jpg"
  } else if (slug === "sale") {
    categoryProducts = products.filter(p => p.isOnSale)
    pageTitle = "Sale"
    pageDescription = "Exclusive discounts on premium linen sarees"
    bannerImage = "/images/festive-saree.jpg"
  }

  if (!category && slug !== "new-arrivals" && slug !== "sale") {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] mt-[104px]">
        <Image
          src={bannerImage || "/placeholder.svg"}
          alt={pageTitle}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
          <nav className="text-sm text-white/80 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/collections" className="hover:text-white">Collections</Link>
            <span className="mx-2">/</span>
            <span>{pageTitle}</span>
          </nav>
          <h1 className="font-serif text-4xl md:text-6xl mb-4">{pageTitle}</h1>
          <p className="text-lg text-white/90 max-w-xl">
            {pageDescription}
          </p>
        </div>
      </section>

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
      <CartSidebar />
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
