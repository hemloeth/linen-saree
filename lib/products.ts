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
  description: string
  details: string[]
  fabric: string
  color: string
  isOnSale: boolean
  isFeatured: boolean
  isNew: boolean
}

export const products: Product[] = [
  // Pure Linen Sarees
  {
    id: "1",
    name: "Brown Color Pure Linen Saree",
    slug: "brown-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2499,
    originalPrice: 4799,
    image: "/images/products/pure-linen-brown.jpg",
    images: [
      "/images/products/pure-linen-brown.jpg",
      "/images/handloom-saree.jpg",
      "/images/casual-saree.jpg"
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
    name: "Royal Blue Pure Linen Saree",
    slug: "royal-blue-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2499,
    originalPrice: 4799,
    image: "/images/products/pure-linen-blue.jpg",
    images: [
      "/images/products/pure-linen-blue.jpg",
      "/images/designer-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Stunning royal blue pure linen saree with silver border. A versatile piece that transitions seamlessly from office wear to evening gatherings.",
    details: [
      "100% Pure Linen Fabric",
      "Silver Thread Border",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Pure Linen",
    color: "Royal Blue",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "3",
    name: "Mustard Yellow Pure Linen Saree",
    slug: "mustard-yellow-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2499,
    originalPrice: 4799,
    image: "/images/products/pure-linen-yellow.jpg",
    images: [
      "/images/products/pure-linen-yellow.jpg",
      "/images/festive-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Vibrant mustard yellow pure linen saree with contrasting border. Perfect for festive occasions and celebrations.",
    details: [
      "100% Pure Linen Fabric",
      "Contrasting Border Design",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Pure Linen",
    color: "Mustard Yellow",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  // Banarasi Silk Linen Sarees
  {
    id: "4",
    name: "Pink Banarasi Silk Linen Saree",
    slug: "pink-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 3999,
    originalPrice: 7499,
    image: "/images/products/banarasi-pink.jpg",
    images: [
      "/images/products/banarasi-pink.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Exquisite pink Banarasi silk linen saree with intricate gold brocade work. A timeless piece for weddings and special occasions.",
    details: [
      "Banarasi Silk Linen Blend",
      "Gold Brocade Work",
      "Handwoven by Master Artisans",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Pink",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "5",
    name: "Red Banarasi Silk Linen Saree",
    slug: "red-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 4299,
    originalPrice: 7999,
    image: "/images/products/banarasi-red.jpg",
    images: [
      "/images/products/banarasi-red.jpg",
      "/images/bridal-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Luxurious deep red Banarasi silk linen saree with rich gold zari brocade. The quintessential bridal choice.",
    details: [
      "Premium Banarasi Silk Linen",
      "Heavy Gold Zari Brocade",
      "Handwoven Traditional Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Deep Red",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  // Handloom Sarees
  {
    id: "6",
    name: "Emerald Green Handloom Saree",
    slug: "emerald-green-handloom-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 2690,
    originalPrice: 4890,
    image: "/images/products/handloom-green.jpg",
    images: [
      "/images/products/handloom-green.jpg",
      "/images/handloom-saree.jpg",
      "/images/casual-saree.jpg"
    ],
    description: "Beautiful emerald green handloom cotton linen saree with traditional temple border. Crafted by skilled artisans using age-old techniques.",
    details: [
      "Handwoven Cotton Linen",
      "Temple Border Design",
      "Artisan Crafted",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Cotton Linen",
    color: "Emerald Green",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "7",
    name: "Rust Ikat Handloom Saree",
    slug: "rust-ikat-handloom-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 2890,
    originalPrice: 5290,
    image: "/images/products/handloom-rust.jpg",
    images: [
      "/images/products/handloom-rust.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Stunning rust colored handloom linen saree with authentic ikat pattern. Each piece is uniquely handcrafted.",
    details: [
      "Authentic Ikat Weave",
      "Handloom Linen Fabric",
      "Unique Pattern Each Piece",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Handloom Linen",
    color: "Rust",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  // Silk Linen Sarees
  {
    id: "8",
    name: "Cream Silk Linen Saree",
    slug: "cream-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3499,
    originalPrice: 5999,
    image: "/images/products/silk-cream.jpg",
    images: [
      "/images/products/silk-cream.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Elegant cream silk linen saree with subtle gold thread work. Perfect for sophisticated occasions and formal events.",
    details: [
      "Premium Silk Linen Blend",
      "Subtle Gold Thread Work",
      "Sophisticated Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Silk Linen",
    color: "Cream",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "9",
    name: "Navy Blue Silk Linen Saree",
    slug: "navy-blue-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3699,
    originalPrice: 6299,
    image: "/images/products/silk-navy.jpg",
    images: [
      "/images/products/silk-navy.jpg",
      "/images/designer-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Sophisticated navy blue silk linen saree with copper zari work. An elegant choice for evening events.",
    details: [
      "Premium Silk Linen Blend",
      "Copper Zari Work",
      "Evening Wear Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen",
    color: "Navy Blue",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  // Embroidery Sarees
  {
    id: "10",
    name: "Maroon Embroidery Linen Saree",
    slug: "maroon-embroidery-linen-saree",
    category: "Embroidery",
    categorySlug: "embroidery",
    price: 2690,
    originalPrice: 4890,
    image: "/images/products/embroidery-maroon.jpg",
    images: [
      "/images/products/embroidery-maroon.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Beautiful maroon linen saree with delicate embroidery work on pallu. A perfect blend of tradition and elegance.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Maroon",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "11",
    name: "Kota Orange Linen Saree",
    slug: "kota-orange-linen-saree",
    category: "Kota Linen",
    categorySlug: "kota-linen",
    price: 2290,
    originalPrice: 4290,
    image: "/images/products/kota-orange.jpg",
    images: [
      "/images/products/kota-orange.jpg",
      "/images/casual-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Lightweight orange Kota linen saree with traditional checks pattern. Perfect for summer and casual occasions.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Orange",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "12",
    name: "White Cotton Linen Saree",
    slug: "white-cotton-linen-saree",
    category: "Cotton Linen",
    categorySlug: "cotton-linen",
    price: 1999,
    originalPrice: 3999,
    image: "/images/products/cotton-white.jpg",
    images: [
      "/images/products/cotton-white.jpg",
      "/images/casual-saree.jpg",
      "/images/handloom-saree.jpg"
    ],
    description: "Pristine white cotton linen saree with delicate silver border. The epitome of minimalist elegance.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Minimalist Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "White",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  }
]

export const categories = [
  {
    name: "Pure Linen",
    slug: "pure-linen",
    image: "/images/products/pure-linen-brown.jpg",
    description: "Authentic pure linen sarees for everyday elegance"
  },
  {
    name: "Banarasi Silk",
    slug: "banarasi-silk",
    image: "/images/products/banarasi-pink.jpg",
    description: "Luxurious Banarasi silk linen blends for special occasions"
  },
  {
    name: "Handloom",
    slug: "handloom",
    image: "/images/products/handloom-green.jpg",
    description: "Artisan crafted handloom sarees with traditional weaves"
  },
  {
    name: "Silk Linen",
    slug: "silk-linen",
    image: "/images/products/silk-cream.jpg",
    description: "Premium silk linen blends for sophisticated occasions"
  },
  {
    name: "Embroidery",
    slug: "embroidery",
    image: "/images/products/embroidery-maroon.jpg",
    description: "Beautifully embroidered linen sarees"
  },
  {
    name: "Kota Linen",
    slug: "kota-linen",
    image: "/images/products/kota-orange.jpg",
    description: "Lightweight Kota linen sarees for summer"
  },
  {
    name: "Cotton Linen",
    slug: "cotton-linen",
    image: "/images/products/cotton-white.jpg",
    description: "Comfortable cotton linen blends for daily wear"
  }
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(p => p.categorySlug === categorySlug)
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.isFeatured)
}

export function getNewProducts(): Product[] {
  return products.filter(p => p.isNew)
}
