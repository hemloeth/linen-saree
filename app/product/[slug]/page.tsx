import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetails } from "@/components/product-details"
import { RelatedProducts } from "@/components/related-products"
import { products, getProductBySlug, getProductsByCategory } from "@/lib/products"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  
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
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = getProductsByCategory(product.categorySlug)
    .filter(p => p.id !== product.id)
    .slice(0, 4)

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-[96px] lg:pt-[104px]">
        <ProductDetails product={product} />
        <RelatedProducts products={relatedProducts} category={product.category} />
      </div>

      <Footer />
    </main>
  )
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}
