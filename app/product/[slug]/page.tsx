import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductDetails } from "@/components/products/product-details"
import { ProductReviews } from "@/components/products/product-reviews"
import { RelatedProducts } from "@/components/products/related-products"
import { fetchProductsFromDB, getProductBySlug, getProductsByCategory } from "@/lib/products"
import type { Product } from "@/lib/products"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  const products = await fetchProductsFromDB()
  const product = getProductBySlug(products, slug)
  return product || null
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: "Product Not Found | Linen Sarees"
    }
  }

  return {
    title: `${product.name} | Linen Sarees`,
    description: product.description
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const products = await fetchProductsFromDB()
  const product = getProductBySlug(products, slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = getProductsByCategory(products, product.categorySlug)
    .filter(p => p.id !== product.id)
    .slice(0, 4)

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-[96px] lg:pt-[104px]">
        <ProductDetails product={product} />

        {/* Reviews Section */}
        <div id="reviews">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>

        <RelatedProducts products={relatedProducts} category={product.category} />
      </div>

      <Footer />
    </main>
  )
}

export async function generateStaticParams() {
  const products = await fetchProductsFromDB()
  return products.map((product) => ({
    slug: product.slug,
  }))
}
