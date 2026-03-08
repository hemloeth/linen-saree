export interface Product {
  id: string
  name: string
  slug: string
  category: string
  categorySlug: string
  price: number
  originalPrice: number
  image: string
  images: string[]
  videos?: string[]
  description: string
  details: string[]
  fabric: string
  color: string
  isOnSale: boolean
  isFeatured: boolean
  isNew: boolean
  // Review stats (computed dynamically)
  averageRating?: number
  totalReviews?: number
  // Specification fields
  material?: string
  sareeSize?: string
  blouseSize?: string
  washCare?: string
  dispatch?: string
  disclaimer?: string
  internationalNote?: string
}

// Map a backend product to the frontend Product interface
function mapProductFromDB(dbProduct: any): Product {
  const isVideoStr = typeof dbProduct.videoFile === "string" || typeof dbProduct.videoUrl === "string";

  return {
    id: dbProduct._id.toString(),
    name: dbProduct.name,
    slug: dbProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    category: dbProduct.category,
    categorySlug: dbProduct.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    price: dbProduct.price,
    originalPrice: dbProduct.regularPrice || dbProduct.price,
    image: dbProduct.mainImage,
    images: [
      dbProduct.mainImage,
      ...(dbProduct.galleryImages ? dbProduct.galleryImages.map((img: any) => img.url) : [])
    ].filter(Boolean),
    videos: isVideoStr ? [dbProduct.videoFile || dbProduct.videoUrl].filter(Boolean) : [],
    description: dbProduct.shortDescription || "",
    details: [
      dbProduct.material ? `Material: ${dbProduct.material}` : "",
      dbProduct.sareeSize ? `Saree Size: ${dbProduct.sareeSize}` : "",
      dbProduct.blouseSize ? `Blouse Size: ${dbProduct.blouseSize}` : "",
      dbProduct.washCare ? `Care: ${dbProduct.washCare}` : ""
    ].filter(Boolean),
    fabric: dbProduct.material || "Linen",
    color: dbProduct.color || "Multicolor",
    isOnSale: !!dbProduct.regularPrice && dbProduct.regularPrice > dbProduct.price,
    isFeatured: true, // We can make this dynamic later if the backend supports it
    isNew: true,       // We can make this dynamic later
    material: dbProduct.material,
    sareeSize: dbProduct.sareeSize,
    blouseSize: dbProduct.blouseSize,
    washCare: dbProduct.washCare,
    dispatch: dbProduct.dispatch,
    disclaimer: dbProduct.disclaimer,
    internationalNote: dbProduct.internationalNote
  };
}

// Fetch all products from the backend and map them
export async function fetchProductsFromDB(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/product/allproducts`, {
      cache: 'no-store' // Fetch fresh data on every request
    });

    if (!res.ok) throw new Error("Failed to fetch products");

    const data = await res.json();
    if (data.success && data.products) {
      return data.products.map(mapProductFromDB);
    }
  } catch (error) {
    console.error("Error fetching products from DB, using fallbacks:", error);
  }

  return fallbackProducts;
}

export const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "Brown Color Pure Linen Saree",
    slug: "brown-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2499,
    originalPrice: 4799,
    image: "/images/s/s1.jpg",
    images: [
      "/images/s/s1.jpg",
      "/images/s/s2.jpg",
      "/images/s/s3.jpg",
      "/images/s/s4.jpg"
    ],
    videos: [
      "/bluesaree.mp4",
      "/dupaataa.mp4"
    ],
    description: "Elegant brown pure linen saree with gold zari border. Perfect for casual gatherings and daily wear. The soft texture and breathable fabric make it ideal for all seasons.",
    details: [
      "100% Pure Linen Fabric",
      "Gold Zari Border",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Pure Linen",
    color: "Brown",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "2",
    name: "Classic Banarasi Silk Saree",
    slug: "classic-banarasi-silk-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 12500,
    originalPrice: 15999,
    image: "/images/sb/sb1.jpg",
    images: [
      "/images/sb/sb1.jpg",
      "/images/sb/sb2.jpg",
      "/images/sb/sb3.jpg",
      "/images/sb/sb4.jpg",
      "/images/sb/sb5.jpg"
    ],
    description: "Traditional Banarasi silk saree with intricate zari work. A masterpiece of craftsmanship perfect for weddings.",
    details: [
      "Material: Pure Banarasi Silk",
      "Weave: Traditional Zari",
      "Occasion: Wedding & Festive",
      "Blouse Piece: Included",
      "Care: Dry Clean Only"
    ],
    fabric: "Silk",
    color: "Red",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "3",
    name: "Handloom Linen Saree",
    slug: "handloom-linen-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 4800,
    originalPrice: 6500,
    image: "/images/sc/sc1.jpg",
    images: [
      "/images/sc/sc1.jpg",
      "/images/sc/sc2.jpg",
      "/images/sc/sc3.jpg",
      "/images/sc/sc4.jpg",
      "/images/sc/sc5.jpg"
    ],
    description: "Authentic handloom linen saree with contemporary design. Breathable and elegant for all-day comfort.",
    details: [
      "Material: 100% Linen",
      "Weave: Handloom",
      "Length: 6.5 meters",
      "Blouse Piece: Included",
      "Care: Dry Clean/Gentle Wash"
    ],
    fabric: "Linen",
    color: "Multi",
    isOnSale: false,
    isFeatured: true,
    isNew: true
  },
  {
    id: "4",
    name: "Silk Linen Blend Saree",
    slug: "silk-linen-blend-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 6500,
    originalPrice: 8000,
    image: "/images/sd/sd1.jpg",
    images: [
      "/images/sd/sd1.jpg",
      "/images/sd/sd2.jpg",
      "/images/sd/sd3.jpg",
      "/images/sd/sd4.jpg",
      "/images/sd/sd5.jpg"
    ],
    description: "Perfect blend of silk and linen for comfort and elegance. The sheen of silk meets the texture of linen.",
    details: [
      "Material: Silk Linen Blend",
      "Pattern: Floral Print",
      "Occasion: Party Wear",
      "Blouse Piece: Included",
      "Care: Dry Clean Only"
    ],
    fabric: "Silk Linen",
    color: "Green",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "5",
    name: "Embroidered Linen Saree",
    slug: "embroidered-linen-saree",
    category: "Embroidery",
    categorySlug: "embroidery",
    price: 7200,
    originalPrice: 8500,
    image: "/images/se/se1.jpg",
    images: [
      "/images/se/se1.jpg",
      "/images/se/se2.jpg",
      "/images/se/se3.jpg",
      "/images/se/se4.jpg",
      "/images/se/se5.jpg"
    ],
    description: "Exquisite embroidery work on premium linen fabric. A stunning choice for festive occasions.",
    details: [
      "Material: Pure Linen",
      "Work: Hand Embroidery",
      "Occasion: Special Occasions",
      "Blouse Piece: Included",
      "Care: Dry Clean Only"
    ],
    fabric: "Linen",
    color: "Pink",
    isOnSale: false,
    isFeatured: true,
    isNew: false
  },
  {
    id: "6",
    name: "Kota Linen Saree",
    slug: "kota-linen-saree",
    category: "Kota Linen",
    categorySlug: "kota-linen",
    price: 3500,
    originalPrice: 4200,
    image: "/images/sf/sf1.jpg",
    images: [
      "/images/sf/sf1.jpg",
      "/images/sf/sf2.jpg",
      "/images/sf/sf3.jpg",
      "/images/sf/sf4.jpg",
      "/images/sf/sf5.jpg"
    ],
    description: "Lightweight Kota linen saree perfect for daily wear. Airy and comfortable for summer.",
    details: [
      "Material: Kota Linen",
      "Weave: Kota Doria",
      "Weight: Lightweight",
      "Blouse Piece: Included",
      "Care: Hand Wash"
    ],
    fabric: "Kota Linen",
    color: "Yellow",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "7",
    name: "Cotton Linen Saree",
    slug: "cotton-linen-saree",
    category: "Cotton Linen",
    categorySlug: "cotton-linen",
    price: 3200,
    originalPrice: 3800,
    image: "/images/sg/sg1.jpg",
    images: [
      "/images/sg/sg1.jpg",
      "/images/sg/sg2.jpg",
      "/images/sg/sg3.jpg",
      "/images/sg/sg4.jpg",
      "/images/sg/sg5.jpg"
    ],
    description: "Comfortable cotton linen saree for summer. The best of both worlds with softness and durability.",
    details: [
      "Material: Cotton Linen",
      "Texture: Soft",
      "Occasion: Casual/Office",
      "Blouse Piece: Included",
      "Care: Machine Washable"
    ],
    fabric: "Cotton Linen",
    color: "White",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "8",
    name: "Bridal Linen Collection",
    slug: "bridal-linen-collection",
    category: "Bridal Collection",
    categorySlug: "bridal-collection",
    price: 15000,
    originalPrice: 18000,
    image: "/images/sh/sh1.jpg",
    images: [
      "/images/sh/sh1.jpg",
      "/images/sh/sh2.jpg",
      "/images/sh/sh3.jpg",
      "/images/sh/sh4.jpg",
      "/images/sh/sh5.jpg"
    ],
    description: "Exclusive bridal linen saree with heavy work. Make your special day unforgettable.",
    details: [
      "Material: Premium Linen Silk",
      "Work: Heavy Zari & Embroidery",
      "Occasion: Bridal/Wedding",
      "Blouse Piece: Included",
      "Care: Dry Clean Only"
    ],
    fabric: "Linen Silk",
    color: "Red",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "9",
    name: "Olive Green Pure Linen Saree",
    slug: "olive-green-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2299,
    originalPrice: 4599,
    image: "/images/sa/sa1.jpg",
    images: [
      "/images/sa/sa1.jpg",
      "/images/sa/sa2.jpg",
      "/images/sa/sa3.jpg",
      "/images/sa/sa4.jpg"
    ],
    description: "Sophisticated olive green pure linen saree with gold zari border. Perfect for office wear and casual gatherings.",
    details: [
      "100% Pure Linen Fabric",
      "Gold Zari Border",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Pure Linen",
    color: "Olive Green",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  }
]

export const categories = [
  {
    name: "Pure Linen",
    slug: "pure-linen",
    image: "/images/s/s1.jpg",
    description: "Authentic pure linen sarees for everyday elegance"
  },
  {
    name: "Banarasi Silk",
    slug: "banarasi-silk",
    image: "/images/sb/sb1.jpg",
    description: "Luxurious Banarasi silk linen blends for special occasions"
  },
  {
    name: "Handloom",
    slug: "handloom",
    image: "/images/sc/sc1.jpg",
    description: "Artisan crafted handloom sarees with traditional weaves"
  },
  {
    name: "Silk Linen",
    slug: "silk-linen",
    image: "/images/sd/sd1.jpg",
    description: "Premium silk linen blends for sophisticated occasions"
  },
  {
    name: "Embroidery",
    slug: "embroidery",
    image: "/images/se/se1.jpg",
    description: "Beautifully embroidered linen sarees"
  },
  {
    name: "Kota Linen",
    slug: "kota-linen",
    image: "/images/sf/sf1.jpg",
    description: "Lightweight Kota linen sarees for summer"
  },
  {
    name: "Cotton Linen",
    slug: "cotton-linen",
    image: "/images/sg/sg1.jpg",
    description: "Comfortable cotton linen blends for daily wear"
  },
  {
    name: "Bridal Collection",
    slug: "bridal-collection",
    image: "/images/sh/sh1.jpg",
    description: "Exquisite bridal sarees for your special day"
  }
]

export function getProductBySlug(productsList: Product[], slug: string): Product | undefined {
  return productsList.find(p => p.slug === slug)
}

export function getProductsByCategory(productsList: Product[], categorySlug: string): Product[] {
  return productsList.filter(p => p.categorySlug === categorySlug)
}

export function getFeaturedProducts(productsList: Product[]): Product[] {
  return productsList.filter(p => p.isFeatured)
}

export function getNewProducts(productsList: Product[]): Product[] {
  return productsList.filter(p => p.isNew)
}

export function getBestSellers(productsList: Product[]): Product[] {
  return productsList
    .filter(p => p.isFeatured || p.isOnSale)
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      const aDiscount = ((a.originalPrice - a.price) / a.originalPrice) * 100
      const bDiscount = ((b.originalPrice - b.price) / b.originalPrice) * 100
      return bDiscount - aDiscount
    })
    .slice(0, 12)
}

// Filter and Sort Types
export type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest' | 'name-asc' | 'name-desc' | 'color-asc' | 'color-desc'

export interface FilterOptions {
  categories?: string[]
  colors?: string[]
  fabrics?: string[]
  priceRange?: {
    min: number
    max: number
  }
  isOnSale?: boolean
  isFeatured?: boolean
  isNew?: boolean
}

// Get unique values for filters
export function getUniqueColors(productsList: Product[]): string[] {
  return [...new Set(productsList.map(p => p.color))].sort()
}

export function getUniqueFabrics(productsList: Product[]): string[] {
  return [...new Set(productsList.map(p => p.fabric))].sort()
}

export function getPriceRange(productsList: Product[]): { min: number; max: number } {
  const prices = productsList.map(p => p.price)
  if (prices.length === 0) return { min: 0, max: 0 }
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  }
}

// Filter products
export function filterProducts(products: Product[], filters: FilterOptions): Product[] {
  return products.filter(product => {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(product.categorySlug)) {
        return false
      }
    }

    // Color filter
    if (filters.colors && filters.colors.length > 0) {
      if (!filters.colors.includes(product.color)) {
        return false
      }
    }

    // Fabric filter
    if (filters.fabrics && filters.fabrics.length > 0) {
      if (!filters.fabrics.includes(product.fabric)) {
        return false
      }
    }

    // Price range filter
    if (filters.priceRange) {
      if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
        return false
      }
    }

    // Sale filter
    if (filters.isOnSale !== undefined) {
      if (product.isOnSale !== filters.isOnSale) {
        return false
      }
    }

    // Featured filter
    if (filters.isFeatured !== undefined) {
      if (product.isFeatured !== filters.isFeatured) {
        return false
      }
    }

    // New filter
    if (filters.isNew !== undefined) {
      if (product.isNew !== filters.isNew) {
        return false
      }
    }

    return true
  })
}

// Sort products
export function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const sortedProducts = [...products]

  switch (sortBy) {
    case 'featured':
      return sortedProducts.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        if (a.isNew && !b.isNew) return -1
        if (!a.isNew && b.isNew) return 1
        return 0
      })

    case 'price-low':
      return sortedProducts.sort((a, b) => a.price - b.price)

    case 'price-high':
      return sortedProducts.sort((a, b) => b.price - a.price)

    case 'newest':
      return sortedProducts.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1
        if (!a.isNew && b.isNew) return 1
        return 0
      })

    case 'name-asc':
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name))

    case 'name-desc':
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name))

    case 'color-asc':
      return sortedProducts.sort((a, b) => a.color.localeCompare(b.color))

    case 'color-desc':
      return sortedProducts.sort((a, b) => b.color.localeCompare(a.color))

    default:
      return sortedProducts
  }
}

// Enhanced search with filters and sorting
export function searchProducts(
  productsList: Product[],
  query: string,
  filters?: FilterOptions,
  sortBy: SortOption = 'featured'
): Product[] {
  let results = productsList

  // Apply text search if query provided
  if (query.trim()) {
    const searchTerm = query.toLowerCase().trim()

    results = productsList.filter(product => {
      // Exact matches get higher priority
      const exactMatches = [
        product.name.toLowerCase().includes(searchTerm),
        product.category.toLowerCase().includes(searchTerm),
        product.color.toLowerCase().includes(searchTerm),
        product.fabric.toLowerCase().includes(searchTerm)
      ]

      // Partial word matches
      const partialMatches = [
        product.description.toLowerCase().includes(searchTerm),
        product.details.some(detail => detail.toLowerCase().includes(searchTerm))
      ]

      return exactMatches.some(match => match) || partialMatches.some(match => match)
    })
  }

  // Apply filters
  if (filters) {
    results = filterProducts(results, filters)
  }

  // Apply sorting
  results = sortProducts(results, sortBy)

  // For search results, add relevance sorting
  if (query.trim()) {
    const searchTerm = query.toLowerCase().trim()
    results = results.sort((a, b) => {
      // Sort by relevance - exact name matches first
      const aNameMatch = a.name.toLowerCase().includes(searchTerm)
      const bNameMatch = b.name.toLowerCase().includes(searchTerm)

      if (aNameMatch && !bNameMatch) return -1
      if (!aNameMatch && bNameMatch) return 1

      // Then by category matches
      const aCategoryMatch = a.category.toLowerCase().includes(searchTerm)
      const bCategoryMatch = b.category.toLowerCase().includes(searchTerm)

      if (aCategoryMatch && !bCategoryMatch) return -1
      if (!aCategoryMatch && bCategoryMatch) return 1

      return 0
    })
  }

  return results
}
