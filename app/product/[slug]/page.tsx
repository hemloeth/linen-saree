import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductDetails } from "@/components/products/product-details"
import { ProductReviews } from "@/components/products/product-reviews"
import { JsonLd } from "@/components/common/json-ld"
import { RelatedProducts } from "@/components/products/related-products"
import { fetchProductBySku, fetchPaginatedProducts } from "@/lib/products"
import type { Product } from "@/lib/products"
import { notFound } from "next/navigation"
import { resolveMediaUrl } from "@/lib/media"
import { getOpenGraphImageUrl } from "@/lib/cloudinary-utils"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  // Extract SKU from the end of the URL slug (e.g., name-slug-SKU)
  const parts = slug.split('-');
  const sku = parts[parts.length - 1];
  if (!sku) return null;
  return await fetchProductBySku(sku);
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

  const ogImageUrl = getOpenGraphImageUrl(finalImages[0]);

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
          url: ogImageUrl,
          width: 1200,
          height: 630,
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
      images: [ogImageUrl],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const product = await getProduct(slug);

  if (!product) {
    notFound()
  }

  // Fetch only related products efficiently
  const relatedResponse = await fetchPaginatedProducts({ category: product.category, limit: 5 });
  const relatedProducts = relatedResponse.products
    .filter(p => p.id !== product.id)
    .slice(0, 4);

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

      <div style={{ paddingTop: 'calc(var(--header-offset, 100px))' }}>
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
