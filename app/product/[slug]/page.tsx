import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductDetails } from "@/components/products/product-details"
import { ProductReviews } from "@/components/products/product-reviews"
import { JsonLd } from "@/components/common/json-ld"
import { RelatedProducts } from "@/components/products/related-products"
import { fetchProductsFromDB, getProductBySlug, getProductsByCategory } from "@/lib/products"
import type { Product } from "@/lib/products"
import { notFound } from "next/navigation"
import { resolveMediaUrl } from "@/lib/media"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  const products = await fetchProductsFromDB()
  const product = getProductBySlug(products, slug)
  return product || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: "Product Not Found | Linen Sarees"
    }
  }

  const images = []
  if (product.image) images.push(resolveMediaUrl(product.image))
  if (product.images) images.push(...product.images.map(img => resolveMediaUrl(img)))

  const finalImages = images.length > 0 ? images : ["/placeholder.svg"]

  return {
    title: `${product.name} | Linen Sarees`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Linen Sarees`,
      description: product.description,
      url: `/product/${slug}`,
      siteName: 'Linen Sarees',
      images: [
        {
          url: finalImages[0],
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Linen Sarees`,
      description: product.description,
      images: [finalImages[0]],
    },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Linen Saree"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_BASE_URL || ''}/product/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock && product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock"
    },
    ...(product.averageRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.averageRating,
        "reviewCount": product.totalReviews || 0
      }
    })
  }

  return (
    <main className="min-h-screen">
      <Header />
      <JsonLd data={jsonLd} />

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
