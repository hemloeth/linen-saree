import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageHeroSlider } from "@/components/sections/page-hero-slider"
import {
  fetchProductsFromDB,
  categories,
  getProductsByCategory,
  getNewProducts,
  fetchPaginatedProducts
} from "@/lib/products"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { CategoryProductsClient } from "./category-products-client"
import { Suspense } from "react"
import { apiServerGet, API_BASE_URL } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/media"

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Define different slide sets for different productCollection types
  const getCollectionSlides = (slug: string, category: any, festiveData?: any) => {
    const baseSlides = [
      {
        id: `${slug}-main`,
        image: resolveMediaUrl(category?.image),
        title: category?.name || "Collection",
        subtitle: category?.description || ""
      }
    ]

    // Add specific slides based on productCollection type
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
            image: "/images/banarasi-pink.jpg",
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
            subtitle: "Discover our latest productCollection of handcrafted linen sarees"
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

      case "festive":
        return [
          {
            id: "festive-main",
            image: resolveMediaUrl(festiveData?.image),
            title: festiveData?.title2 || "Festive Collection",
            subtitle: festiveData?.description || "Discover our latest curated festive sarees for every celebration"
          }
        ]

      case "celebrity":
        return [
          {
            id: "celebrity-main",
            image: "/images/celebrity-look.jpg",
            title: "Celebrity Collection",
            subtitle: "Get the iconic look with our celebrity-inspired linen sarees"
          }
        ]

      default:
        return baseSlides
    }

  // Add specific slides based on productCollection type
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
          subtitle: "Discover our latest productCollection of handcrafted linen sarees"
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

    case "festive":
      return [
        {
          id: "festive-main",
          image: resolveMediaUrl(festiveData?.image),
          title: festiveData?.title2 || "Festive Collection",
          subtitle: festiveData?.description || "Discover our latest curated festive sarees for every celebration"
        }
      ]

    case "celebrity":
      return [
        {
          id: "celebrity-main",
          image: "/images/celebrity-look.jpg",
          title: "Celebrity Collection",
          subtitle: "Get the iconic look with our celebrity-inspired linen sarees"
        }
      ]

    default:
      return baseSlides
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
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

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const resolvedSearchParams = await searchParams;

  const MARKETING_SLUGS = ["festive", "sale", "celebrity", "new-arrivals", "big-sale"];
  if (MARKETING_SLUGS.includes(slug)) {
    redirect(`/collections/${slug}`);
  }

  // Fetch paginated products for this specific category
  const { products: categoryProducts, pagination } = await fetchPaginatedProducts({
    ...resolvedSearchParams,
    category: slug,
    limit: 20
  })

  // Fetch marketing collections for the sub-nav
  const colRes = await apiServerGet('/api/marketing-collections')
  const marketingCollectionsList = colRes.success ? colRes.data.filter((c: any) => c.key !== 'none') : []

  let category = categories.find(c => c.slug === slug)
  let pageTitle = category?.name || "Collection"
  let pageDescription = category?.description || ""

  let festiveBannerData = null; // Unused for normal categories, but kept to satisfy getCollectionSlides signature

  if (!category) {
    notFound()
  }

  // Get slides for this productCollection
  let productCollectionSlides = getCollectionSlides(slug, category, festiveBannerData)

  // Fetch Category Specific Banner from dynamic system
  if (slug !== "festive") {
    try {
      const response = await apiServerGet(`/api/category-banner/${slug}`, { cache: 'no-store' });
      if (response.success && response.data) {
        const dyn = response.data;
        productCollectionSlides = [
          {
            id: `dyn-${slug}`,
            image: resolveMediaUrl(dyn.image),
            title: dyn.title,
            subtitle: dyn.subtitle || dyn.description || ""
          }
        ];
      }
    } catch (error) {
      console.warn(`Dynamic banner fetch skipped/failed for ${slug}, using defaults.`);
    }
  }

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: pageTitle }
  ]

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Banner with Auto-Scroll */}
      <div className="mt-[96px] lg:mt-[104px]">
        <PageHeroSlider
          slides={productCollectionSlides}
          height="40vh"
          breadcrumbs={breadcrumbs}
        />
      </div>

      {/* Categories Sub-nav */}
      <section className="bg-secondary border-b border-border py-8">
        <div className="max-w-[1500px] mx-auto px-2 sm:px-6 lg:px-10">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/categories"
              className={`px-5 py-2 text-sm tracking-wide transition-colors ${!slug || slug === 'all'
                ? "bg-foreground text-background"
                : "border border-border hover:bg-foreground hover:text-background"
                }`}
            >
              All Fabrics
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={`px-5 py-2 text-sm tracking-wide transition-colors ${cat.slug === slug
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

      {/* Products Section - Client Component */}
      <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading products...</div>}>
        <CategoryProductsClient 
          initialProducts={categoryProducts} 
          pagination={pagination}
          pageTitle={pageTitle} 
        />
      </Suspense>

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
    { slug: "festive" },
    { slug: "celebrity" },
  ]
}
