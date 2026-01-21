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
  {
    id: "13",
    name: "Olive Green Pure Linen Saree",
    slug: "olive-green-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2299,
    originalPrice: 4599,
    image: "/images/products/pure-linen-brown.jpg",
    images: [
      "/images/products/pure-linen-brown.jpg",
      "/images/handloom-saree.jpg",
      "/images/casual-saree.jpg"
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
  },
  {
    id: "14",
    name: "Coral Pink Pure Linen Saree",
    slug: "coral-pink-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2599,
    originalPrice: 4899,
    image: "/images/products/pure-linen-blue.jpg",
    images: [
      "/images/products/pure-linen-blue.jpg",
      "/images/designer-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Beautiful coral pink pure linen saree with silver border. A versatile piece for day and evening wear.",
    details: [
      "100% Pure Linen Fabric",
      "Silver Thread Border",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Pure Linen",
    color: "Coral Pink",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "15",
    name: "Teal Blue Pure Linen Saree",
    slug: "teal-blue-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2399,
    originalPrice: 4699,
    image: "/images/products/pure-linen-yellow.jpg",
    images: [
      "/images/products/pure-linen-yellow.jpg",
      "/images/festive-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Elegant teal blue pure linen saree with contrasting border. Perfect for festive occasions and celebrations.",
    details: [
      "100% Pure Linen Fabric",
      "Contrasting Border Design",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Pure Linen",
    color: "Teal Blue",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "16",
    name: "Burgundy Pure Linen Saree",
    slug: "burgundy-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2699,
    originalPrice: 4999,
    image: "/images/products/pure-linen-brown.jpg",
    images: [
      "/images/products/pure-linen-brown.jpg",
      "/images/handloom-saree.jpg",
      "/images/casual-saree.jpg"
    ],
    description: "Rich burgundy pure linen saree with gold zari border. Ideal for formal events and special occasions.",
    details: [
      "100% Pure Linen Fabric",
      "Gold Zari Border",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Pure Linen",
    color: "Burgundy",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "17",
    name: "Lavender Pure Linen Saree",
    slug: "lavender-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2449,
    originalPrice: 4749,
    image: "/images/products/pure-linen-blue.jpg",
    images: [
      "/images/products/pure-linen-blue.jpg",
      "/images/designer-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Soft lavender pure linen saree with silver border. A graceful choice for daytime events.",
    details: [
      "100% Pure Linen Fabric",
      "Silver Thread Border",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Pure Linen",
    color: "Lavender",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "18",
    name: "Peach Pure Linen Saree",
    slug: "peach-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2549,
    originalPrice: 4849,
    image: "/images/products/pure-linen-yellow.jpg",
    images: [
      "/images/products/pure-linen-yellow.jpg",
      "/images/festive-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Delicate peach pure linen saree with contrasting border. Perfect for summer celebrations.",
    details: [
      "100% Pure Linen Fabric",
      "Contrasting Border Design",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Pure Linen",
    color: "Peach",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "19",
    name: "Charcoal Grey Pure Linen Saree",
    slug: "charcoal-grey-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2799,
    originalPrice: 5099,
    image: "/images/products/pure-linen-brown.jpg",
    images: [
      "/images/products/pure-linen-brown.jpg",
      "/images/handloom-saree.jpg",
      "/images/casual-saree.jpg"
    ],
    description: "Sophisticated charcoal grey pure linen saree with gold zari border. Perfect for corporate events.",
    details: [
      "100% Pure Linen Fabric",
      "Gold Zari Border",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Pure Linen",
    color: "Charcoal Grey",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "20",
    name: "Mint Green Pure Linen Saree",
    slug: "mint-green-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2349,
    originalPrice: 4649,
    image: "/images/products/pure-linen-blue.jpg",
    images: [
      "/images/products/pure-linen-blue.jpg",
      "/images/designer-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Fresh mint green pure linen saree with silver border. A refreshing choice for spring occasions.",
    details: [
      "100% Pure Linen Fabric",
      "Silver Thread Border",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Pure Linen",
    color: "Mint Green",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "21",
    name: "Ivory Pure Linen Saree",
    slug: "ivory-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2649,
    originalPrice: 4949,
    image: "/images/products/pure-linen-yellow.jpg",
    images: [
      "/images/products/pure-linen-yellow.jpg",
      "/images/festive-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Classic ivory pure linen saree with contrasting border. Timeless elegance for any occasion.",
    details: [
      "100% Pure Linen Fabric",
      "Contrasting Border Design",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Pure Linen",
    color: "Ivory",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "22",
    name: "Magenta Pure Linen Saree",
    slug: "magenta-pure-linen-saree",
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
    description: "Vibrant magenta pure linen saree with gold zari border. Bold and beautiful for festive celebrations.",
    details: [
      "100% Pure Linen Fabric",
      "Gold Zari Border",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Pure Linen",
    color: "Magenta",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "23",
    name: "Steel Blue Pure Linen Saree",
    slug: "steel-blue-pure-linen-saree",
    category: "Pure Linen",
    categorySlug: "pure-linen",
    price: 2599,
    originalPrice: 4899,
    image: "/images/products/pure-linen-blue.jpg",
    images: [
      "/images/products/pure-linen-blue.jpg",
      "/images/designer-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Elegant steel blue pure linen saree with silver border. Perfect for professional and formal events.",
    details: [
      "100% Pure Linen Fabric",
      "Silver Thread Border",
      "Running Blouse Piece Included",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Pure Linen",
    color: "Steel Blue",
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
  {
    id: "24",
    name: "Royal Purple Banarasi Silk Linen Saree",
    slug: "royal-purple-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 4199,
    originalPrice: 7799,
    image: "/images/products/banarasi-pink.jpg",
    images: [
      "/images/products/banarasi-pink.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Majestic royal purple Banarasi silk linen saree with intricate gold brocade work. Perfect for grand celebrations.",
    details: [
      "Banarasi Silk Linen Blend",
      "Gold Brocade Work",
      "Handwoven by Master Artisans",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Royal Purple",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "25",
    name: "Golden Yellow Banarasi Silk Linen Saree",
    slug: "golden-yellow-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 4399,
    originalPrice: 8199,
    image: "/images/products/banarasi-red.jpg",
    images: [
      "/images/products/banarasi-red.jpg",
      "/images/bridal-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Radiant golden yellow Banarasi silk linen saree with rich gold zari brocade. Traditional elegance at its finest.",
    details: [
      "Premium Banarasi Silk Linen",
      "Heavy Gold Zari Brocade",
      "Handwoven Traditional Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Golden Yellow",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "26",
    name: "Emerald Green Banarasi Silk Linen Saree",
    slug: "emerald-green-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 4099,
    originalPrice: 7599,
    image: "/images/products/banarasi-pink.jpg",
    images: [
      "/images/products/banarasi-pink.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Stunning emerald green Banarasi silk linen saree with intricate gold brocade work. A regal choice for weddings.",
    details: [
      "Banarasi Silk Linen Blend",
      "Gold Brocade Work",
      "Handwoven by Master Artisans",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Emerald Green",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "27",
    name: "Midnight Blue Banarasi Silk Linen Saree",
    slug: "midnight-blue-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 4499,
    originalPrice: 8399,
    image: "/images/products/banarasi-red.jpg",
    images: [
      "/images/products/banarasi-red.jpg",
      "/images/bridal-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Elegant midnight blue Banarasi silk linen saree with rich gold zari brocade. Perfect for evening celebrations.",
    details: [
      "Premium Banarasi Silk Linen",
      "Heavy Gold Zari Brocade",
      "Handwoven Traditional Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Midnight Blue",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "28",
    name: "Coral Orange Banarasi Silk Linen Saree",
    slug: "coral-orange-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 3899,
    originalPrice: 7299,
    image: "/images/products/banarasi-pink.jpg",
    images: [
      "/images/products/banarasi-pink.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Vibrant coral orange Banarasi silk linen saree with intricate gold brocade work. A festive masterpiece.",
    details: [
      "Banarasi Silk Linen Blend",
      "Gold Brocade Work",
      "Handwoven by Master Artisans",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Coral Orange",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "29",
    name: "Wine Red Banarasi Silk Linen Saree",
    slug: "wine-red-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 4599,
    originalPrice: 8599,
    image: "/images/products/banarasi-red.jpg",
    images: [
      "/images/products/banarasi-red.jpg",
      "/images/bridal-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Rich wine red Banarasi silk linen saree with heavy gold zari brocade. Luxury redefined for special occasions.",
    details: [
      "Premium Banarasi Silk Linen",
      "Heavy Gold Zari Brocade",
      "Handwoven Traditional Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Wine Red",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "30",
    name: "Turquoise Banarasi Silk Linen Saree",
    slug: "turquoise-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 4199,
    originalPrice: 7799,
    image: "/images/products/banarasi-pink.jpg",
    images: [
      "/images/products/banarasi-pink.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Beautiful turquoise Banarasi silk linen saree with intricate gold brocade work. A unique choice for modern brides.",
    details: [
      "Banarasi Silk Linen Blend",
      "Gold Brocade Work",
      "Handwoven by Master Artisans",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Turquoise",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "31",
    name: "Champagne Banarasi Silk Linen Saree",
    slug: "champagne-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 4799,
    originalPrice: 8999,
    image: "/images/products/banarasi-red.jpg",
    images: [
      "/images/products/banarasi-red.jpg",
      "/images/bridal-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Sophisticated champagne Banarasi silk linen saree with rich gold zari brocade. Timeless elegance for grand events.",
    details: [
      "Premium Banarasi Silk Linen",
      "Heavy Gold Zari Brocade",
      "Handwoven Traditional Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Champagne",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "32",
    name: "Magenta Banarasi Silk Linen Saree",
    slug: "magenta-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 4299,
    originalPrice: 7999,
    image: "/images/products/banarasi-pink.jpg",
    images: [
      "/images/products/banarasi-pink.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Vibrant magenta Banarasi silk linen saree with intricate gold brocade work. Bold and beautiful for celebrations.",
    details: [
      "Banarasi Silk Linen Blend",
      "Gold Brocade Work",
      "Handwoven by Master Artisans",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Magenta",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "33",
    name: "Black Banarasi Silk Linen Saree",
    slug: "black-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 4699,
    originalPrice: 8799,
    image: "/images/products/banarasi-red.jpg",
    images: [
      "/images/products/banarasi-red.jpg",
      "/images/bridal-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Classic black Banarasi silk linen saree with heavy gold zari brocade. Sophisticated elegance for formal events.",
    details: [
      "Premium Banarasi Silk Linen",
      "Heavy Gold Zari Brocade",
      "Handwoven Traditional Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Black",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "34",
    name: "Silver Grey Banarasi Silk Linen Saree",
    slug: "silver-grey-banarasi-silk-linen-saree",
    category: "Banarasi Silk",
    categorySlug: "banarasi-silk",
    price: 4399,
    originalPrice: 8199,
    image: "/images/products/banarasi-pink.jpg",
    images: [
      "/images/products/banarasi-pink.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Elegant silver grey Banarasi silk linen saree with intricate gold brocade work. Modern sophistication meets tradition.",
    details: [
      "Banarasi Silk Linen Blend",
      "Gold Brocade Work",
      "Handwoven by Master Artisans",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen Blend",
    color: "Silver Grey",
    isOnSale: true,
    isFeatured: true,
    isNew: true
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
  {
    id: "35",
    name: "Indigo Blue Handloom Saree",
    slug: "indigo-blue-handloom-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 2790,
    originalPrice: 5090,
    image: "/images/products/handloom-green.jpg",
    images: [
      "/images/products/handloom-green.jpg",
      "/images/handloom-saree.jpg",
      "/images/casual-saree.jpg"
    ],
    description: "Traditional indigo blue handloom cotton linen saree with temple border. Crafted using natural dyes and traditional techniques.",
    details: [
      "Handwoven Cotton Linen",
      "Temple Border Design",
      "Natural Indigo Dye",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Cotton Linen",
    color: "Indigo Blue",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "36",
    name: "Maroon Handloom Saree",
    slug: "maroon-handloom-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 2990,
    originalPrice: 5490,
    image: "/images/products/handloom-rust.jpg",
    images: [
      "/images/products/handloom-rust.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Rich maroon handloom linen saree with authentic ikat pattern. Handcrafted by skilled artisans using traditional methods.",
    details: [
      "Authentic Ikat Weave",
      "Handloom Linen Fabric",
      "Traditional Craftsmanship",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Handloom Linen",
    color: "Maroon",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "37",
    name: "Mustard Yellow Handloom Saree",
    slug: "mustard-yellow-handloom-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 2590,
    originalPrice: 4890,
    image: "/images/products/handloom-green.jpg",
    images: [
      "/images/products/handloom-green.jpg",
      "/images/handloom-saree.jpg",
      "/images/casual-saree.jpg"
    ],
    description: "Vibrant mustard yellow handloom cotton linen saree with temple border. Perfect for festive occasions.",
    details: [
      "Handwoven Cotton Linen",
      "Temple Border Design",
      "Artisan Crafted",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Cotton Linen",
    color: "Mustard Yellow",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "38",
    name: "Teal Green Handloom Saree",
    slug: "teal-green-handloom-saree",
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
    description: "Beautiful teal green handloom linen saree with authentic ikat pattern. Each piece showcases unique artisan craftsmanship.",
    details: [
      "Authentic Ikat Weave",
      "Handloom Linen Fabric",
      "Unique Pattern Each Piece",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Handloom Linen",
    color: "Teal Green",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "39",
    name: "Coral Pink Handloom Saree",
    slug: "coral-pink-handloom-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 2690,
    originalPrice: 4990,
    image: "/images/products/handloom-green.jpg",
    images: [
      "/images/products/handloom-green.jpg",
      "/images/handloom-saree.jpg",
      "/images/casual-saree.jpg"
    ],
    description: "Elegant coral pink handloom cotton linen saree with temple border. Soft and comfortable for daily wear.",
    details: [
      "Handwoven Cotton Linen",
      "Temple Border Design",
      "Artisan Crafted",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Cotton Linen",
    color: "Coral Pink",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "40",
    name: "Olive Green Handloom Saree",
    slug: "olive-green-handloom-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 2790,
    originalPrice: 5190,
    image: "/images/products/handloom-rust.jpg",
    images: [
      "/images/products/handloom-rust.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Sophisticated olive green handloom linen saree with authentic ikat pattern. Perfect for contemporary styling.",
    details: [
      "Authentic Ikat Weave",
      "Handloom Linen Fabric",
      "Contemporary Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Handloom Linen",
    color: "Olive Green",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "41",
    name: "Lavender Handloom Saree",
    slug: "lavender-handloom-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 2590,
    originalPrice: 4890,
    image: "/images/products/handloom-green.jpg",
    images: [
      "/images/products/handloom-green.jpg",
      "/images/handloom-saree.jpg",
      "/images/casual-saree.jpg"
    ],
    description: "Soft lavender handloom cotton linen saree with temple border. Gentle and graceful for special occasions.",
    details: [
      "Handwoven Cotton Linen",
      "Temple Border Design",
      "Artisan Crafted",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Cotton Linen",
    color: "Lavender",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "42",
    name: "Burgundy Handloom Saree",
    slug: "burgundy-handloom-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 2990,
    originalPrice: 5490,
    image: "/images/products/handloom-rust.jpg",
    images: [
      "/images/products/handloom-rust.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Rich burgundy handloom linen saree with authentic ikat pattern. Deep and luxurious for formal events.",
    details: [
      "Authentic Ikat Weave",
      "Handloom Linen Fabric",
      "Luxury Finish",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Handloom Linen",
    color: "Burgundy",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "43",
    name: "Peach Handloom Saree",
    slug: "peach-handloom-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 2690,
    originalPrice: 4990,
    image: "/images/products/handloom-green.jpg",
    images: [
      "/images/products/handloom-green.jpg",
      "/images/handloom-saree.jpg",
      "/images/casual-saree.jpg"
    ],
    description: "Delicate peach handloom cotton linen saree with temple border. Fresh and feminine for daytime events.",
    details: [
      "Handwoven Cotton Linen",
      "Temple Border Design",
      "Artisan Crafted",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Cotton Linen",
    color: "Peach",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "44",
    name: "Charcoal Grey Handloom Saree",
    slug: "charcoal-grey-handloom-saree",
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
    description: "Modern charcoal grey handloom linen saree with authentic ikat pattern. Contemporary elegance for professional wear.",
    details: [
      "Authentic Ikat Weave",
      "Handloom Linen Fabric",
      "Professional Styling",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Handloom Linen",
    color: "Charcoal Grey",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "45",
    name: "Cream Handloom Saree",
    slug: "cream-handloom-saree",
    category: "Handloom",
    categorySlug: "handloom",
    price: 2590,
    originalPrice: 4890,
    image: "/images/products/handloom-green.jpg",
    images: [
      "/images/products/handloom-green.jpg",
      "/images/handloom-saree.jpg",
      "/images/casual-saree.jpg"
    ],
    description: "Classic cream handloom cotton linen saree with temple border. Timeless elegance for any occasion.",
    details: [
      "Handwoven Cotton Linen",
      "Temple Border Design",
      "Artisan Crafted",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Cotton Linen",
    color: "Cream",
    isOnSale: true,
    isFeatured: true,
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
  {
    id: "46",
    name: "Rose Gold Silk Linen Saree",
    slug: "rose-gold-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3799,
    originalPrice: 6499,
    image: "/images/products/silk-cream.jpg",
    images: [
      "/images/products/silk-cream.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Luxurious rose gold silk linen saree with subtle gold thread work. Perfect for sophisticated celebrations.",
    details: [
      "Premium Silk Linen Blend",
      "Subtle Gold Thread Work",
      "Luxury Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Silk Linen",
    color: "Rose Gold",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "47",
    name: "Emerald Green Silk Linen Saree",
    slug: "emerald-green-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3599,
    originalPrice: 6199,
    image: "/images/products/silk-navy.jpg",
    images: [
      "/images/products/silk-navy.jpg",
      "/images/designer-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Stunning emerald green silk linen saree with copper zari work. A regal choice for special occasions.",
    details: [
      "Premium Silk Linen Blend",
      "Copper Zari Work",
      "Royal Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen",
    color: "Emerald Green",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "48",
    name: "Dusty Pink Silk Linen Saree",
    slug: "dusty-pink-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3399,
    originalPrice: 5899,
    image: "/images/products/silk-cream.jpg",
    images: [
      "/images/products/silk-cream.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Elegant dusty pink silk linen saree with subtle gold thread work. Soft and romantic for daytime events.",
    details: [
      "Premium Silk Linen Blend",
      "Subtle Gold Thread Work",
      "Romantic Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Silk Linen",
    color: "Dusty Pink",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "49",
    name: "Royal Purple Silk Linen Saree",
    slug: "royal-purple-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3899,
    originalPrice: 6699,
    image: "/images/products/silk-navy.jpg",
    images: [
      "/images/products/silk-navy.jpg",
      "/images/designer-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Majestic royal purple silk linen saree with copper zari work. Bold and beautiful for grand celebrations.",
    details: [
      "Premium Silk Linen Blend",
      "Copper Zari Work",
      "Grand Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen",
    color: "Royal Purple",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "50",
    name: "Champagne Silk Linen Saree",
    slug: "champagne-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3999,
    originalPrice: 6899,
    image: "/images/products/silk-cream.jpg",
    images: [
      "/images/products/silk-cream.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Sophisticated champagne silk linen saree with subtle gold thread work. Timeless elegance for formal events.",
    details: [
      "Premium Silk Linen Blend",
      "Subtle Gold Thread Work",
      "Formal Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Silk Linen",
    color: "Champagne",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "51",
    name: "Teal Blue Silk Linen Saree",
    slug: "teal-blue-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3649,
    originalPrice: 6249,
    image: "/images/products/silk-navy.jpg",
    images: [
      "/images/products/silk-navy.jpg",
      "/images/designer-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Beautiful teal blue silk linen saree with copper zari work. Fresh and contemporary for modern occasions.",
    details: [
      "Premium Silk Linen Blend",
      "Copper Zari Work",
      "Contemporary Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen",
    color: "Teal Blue",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "52",
    name: "Ivory Silk Linen Saree",
    slug: "ivory-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3549,
    originalPrice: 6099,
    image: "/images/products/silk-cream.jpg",
    images: [
      "/images/products/silk-cream.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Classic ivory silk linen saree with subtle gold thread work. Pure elegance for sophisticated occasions.",
    details: [
      "Premium Silk Linen Blend",
      "Subtle Gold Thread Work",
      "Classic Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Silk Linen",
    color: "Ivory",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "53",
    name: "Burgundy Silk Linen Saree",
    slug: "burgundy-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3799,
    originalPrice: 6499,
    image: "/images/products/silk-navy.jpg",
    images: [
      "/images/products/silk-navy.jpg",
      "/images/designer-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Rich burgundy silk linen saree with copper zari work. Deep and luxurious for evening celebrations.",
    details: [
      "Premium Silk Linen Blend",
      "Copper Zari Work",
      "Luxury Evening Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen",
    color: "Burgundy",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "54",
    name: "Mint Green Silk Linen Saree",
    slug: "mint-green-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3449,
    originalPrice: 5949,
    image: "/images/products/silk-cream.jpg",
    images: [
      "/images/products/silk-cream.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Fresh mint green silk linen saree with subtle gold thread work. Light and airy for spring celebrations.",
    details: [
      "Premium Silk Linen Blend",
      "Subtle Gold Thread Work",
      "Spring Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Silk Linen",
    color: "Mint Green",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "55",
    name: "Coral Orange Silk Linen Saree",
    slug: "coral-orange-silk-linen-saree",
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
    description: "Vibrant coral orange silk linen saree with copper zari work. Bright and cheerful for festive occasions.",
    details: [
      "Premium Silk Linen Blend",
      "Copper Zari Work",
      "Festive Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Only"
    ],
    fabric: "Silk Linen",
    color: "Coral Orange",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "56",
    name: "Blush Pink Silk Linen Saree",
    slug: "blush-pink-silk-linen-saree",
    category: "Silk Linen",
    categorySlug: "silk-linen",
    price: 3599,
    originalPrice: 6199,
    image: "/images/products/silk-cream.jpg",
    images: [
      "/images/products/silk-cream.jpg",
      "/images/bridal-saree.jpg",
      "/images/celebrity-look.jpg"
    ],
    description: "Delicate blush pink silk linen saree with subtle gold thread work. Soft and feminine for romantic occasions.",
    details: [
      "Premium Silk Linen Blend",
      "Subtle Gold Thread Work",
      "Romantic Collection",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Silk Linen",
    color: "Blush Pink",
    isOnSale: true,
    isFeatured: true,
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
    id: "57",
    name: "Navy Blue Embroidery Linen Saree",
    slug: "navy-blue-embroidery-linen-saree",
    category: "Embroidery",
    categorySlug: "embroidery",
    price: 2790,
    originalPrice: 5090,
    image: "/images/products/embroidery-maroon.jpg",
    images: [
      "/images/products/embroidery-maroon.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Elegant navy blue linen saree with delicate embroidery work on pallu. Sophisticated choice for formal events.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Navy Blue",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "58",
    name: "Emerald Green Embroidery Linen Saree",
    slug: "emerald-green-embroidery-linen-saree",
    category: "Embroidery",
    categorySlug: "embroidery",
    price: 2890,
    originalPrice: 5290,
    image: "/images/products/embroidery-maroon.jpg",
    images: [
      "/images/products/embroidery-maroon.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Stunning emerald green linen saree with delicate embroidery work on pallu. Rich and vibrant for celebrations.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Emerald Green",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "59",
    name: "Royal Purple Embroidery Linen Saree",
    slug: "royal-purple-embroidery-linen-saree",
    category: "Embroidery",
    categorySlug: "embroidery",
    price: 2990,
    originalPrice: 5490,
    image: "/images/products/embroidery-maroon.jpg",
    images: [
      "/images/products/embroidery-maroon.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Majestic royal purple linen saree with delicate embroidery work on pallu. Bold and beautiful for special occasions.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Royal Purple",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "60",
    name: "Dusty Rose Embroidery Linen Saree",
    slug: "dusty-rose-embroidery-linen-saree",
    category: "Embroidery",
    categorySlug: "embroidery",
    price: 2590,
    originalPrice: 4790,
    image: "/images/products/embroidery-maroon.jpg",
    images: [
      "/images/products/embroidery-maroon.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Soft dusty rose linen saree with delicate embroidery work on pallu. Romantic and feminine for daytime events.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Dusty Rose",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "61",
    name: "Teal Blue Embroidery Linen Saree",
    slug: "teal-blue-embroidery-linen-saree",
    category: "Embroidery",
    categorySlug: "embroidery",
    price: 2790,
    originalPrice: 5090,
    image: "/images/products/embroidery-maroon.jpg",
    images: [
      "/images/products/embroidery-maroon.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Beautiful teal blue linen saree with delicate embroidery work on pallu. Fresh and contemporary styling.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Teal Blue",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "62",
    name: "Mustard Yellow Embroidery Linen Saree",
    slug: "mustard-yellow-embroidery-linen-saree",
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
    description: "Vibrant mustard yellow linen saree with delicate embroidery work on pallu. Bright and cheerful for festivities.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Mustard Yellow",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "63",
    name: "Burgundy Embroidery Linen Saree",
    slug: "burgundy-embroidery-linen-saree",
    category: "Embroidery",
    categorySlug: "embroidery",
    price: 2890,
    originalPrice: 5290,
    image: "/images/products/embroidery-maroon.jpg",
    images: [
      "/images/products/embroidery-maroon.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Rich burgundy linen saree with delicate embroidery work on pallu. Deep and luxurious for formal occasions.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Burgundy",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "64",
    name: "Coral Pink Embroidery Linen Saree",
    slug: "coral-pink-embroidery-linen-saree",
    category: "Embroidery",
    categorySlug: "embroidery",
    price: 2590,
    originalPrice: 4790,
    image: "/images/products/embroidery-maroon.jpg",
    images: [
      "/images/products/embroidery-maroon.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Elegant coral pink linen saree with delicate embroidery work on pallu. Soft and graceful for special moments.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Coral Pink",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "65",
    name: "Olive Green Embroidery Linen Saree",
    slug: "olive-green-embroidery-linen-saree",
    category: "Embroidery",
    categorySlug: "embroidery",
    price: 2790,
    originalPrice: 5090,
    image: "/images/products/embroidery-maroon.jpg",
    images: [
      "/images/products/embroidery-maroon.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Sophisticated olive green linen saree with delicate embroidery work on pallu. Earthy and elegant styling.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Olive Green",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "66",
    name: "Lavender Embroidery Linen Saree",
    slug: "lavender-embroidery-linen-saree",
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
    description: "Gentle lavender linen saree with delicate embroidery work on pallu. Soft and soothing for peaceful occasions.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Lavender",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "67",
    name: "Cream Embroidery Linen Saree",
    slug: "cream-embroidery-linen-saree",
    category: "Embroidery",
    categorySlug: "embroidery",
    price: 2890,
    originalPrice: 5290,
    image: "/images/products/embroidery-maroon.jpg",
    images: [
      "/images/products/embroidery-maroon.jpg",
      "/images/festive-saree.jpg",
      "/images/designer-saree.jpg"
    ],
    description: "Classic cream linen saree with delicate embroidery work on pallu. Timeless elegance for any celebration.",
    details: [
      "Pure Linen Fabric",
      "Delicate Hand Embroidery",
      "Designer Pallu",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Dry Clean Recommended"
    ],
    fabric: "Embroidered Linen",
    color: "Cream",
    isOnSale: true,
    isFeatured: false,
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
    id: "68",
    name: "Kota Pink Linen Saree",
    slug: "kota-pink-linen-saree",
    category: "Kota Linen",
    categorySlug: "kota-linen",
    price: 2190,
    originalPrice: 4090,
    image: "/images/products/kota-orange.jpg",
    images: [
      "/images/products/kota-orange.jpg",
      "/images/casual-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Soft pink Kota linen saree with traditional checks pattern. Gentle and feminine for daytime wear.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Pink",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "69",
    name: "Kota Blue Linen Saree",
    slug: "kota-blue-linen-saree",
    category: "Kota Linen",
    categorySlug: "kota-linen",
    price: 2390,
    originalPrice: 4490,
    image: "/images/products/kota-orange.jpg",
    images: [
      "/images/products/kota-orange.jpg",
      "/images/casual-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Cool blue Kota linen saree with traditional checks pattern. Refreshing choice for summer occasions.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Blue",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "70",
    name: "Kota Green Linen Saree",
    slug: "kota-green-linen-saree",
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
    description: "Fresh green Kota linen saree with traditional checks pattern. Natural and soothing for casual events.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Green",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "71",
    name: "Kota Yellow Linen Saree",
    slug: "kota-yellow-linen-saree",
    category: "Kota Linen",
    categorySlug: "kota-linen",
    price: 2190,
    originalPrice: 4090,
    image: "/images/products/kota-orange.jpg",
    images: [
      "/images/products/kota-orange.jpg",
      "/images/casual-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Bright yellow Kota linen saree with traditional checks pattern. Cheerful and vibrant for festive wear.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Yellow",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "72",
    name: "Kota Purple Linen Saree",
    slug: "kota-purple-linen-saree",
    category: "Kota Linen",
    categorySlug: "kota-linen",
    price: 2390,
    originalPrice: 4490,
    image: "/images/products/kota-orange.jpg",
    images: [
      "/images/products/kota-orange.jpg",
      "/images/casual-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Elegant purple Kota linen saree with traditional checks pattern. Regal and sophisticated for special occasions.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Purple",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "73",
    name: "Kota Maroon Linen Saree",
    slug: "kota-maroon-linen-saree",
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
    description: "Rich maroon Kota linen saree with traditional checks pattern. Deep and luxurious for formal events.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Maroon",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "74",
    name: "Kota Teal Linen Saree",
    slug: "kota-teal-linen-saree",
    category: "Kota Linen",
    categorySlug: "kota-linen",
    price: 2390,
    originalPrice: 4490,
    image: "/images/products/kota-orange.jpg",
    images: [
      "/images/products/kota-orange.jpg",
      "/images/casual-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Beautiful teal Kota linen saree with traditional checks pattern. Contemporary and stylish for modern wear.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Teal",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "75",
    name: "Kota Coral Linen Saree",
    slug: "kota-coral-linen-saree",
    category: "Kota Linen",
    categorySlug: "kota-linen",
    price: 2190,
    originalPrice: 4090,
    image: "/images/products/kota-orange.jpg",
    images: [
      "/images/products/kota-orange.jpg",
      "/images/casual-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Vibrant coral Kota linen saree with traditional checks pattern. Bright and cheerful for summer celebrations.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Coral",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "76",
    name: "Kota Lavender Linen Saree",
    slug: "kota-lavender-linen-saree",
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
    description: "Soft lavender Kota linen saree with traditional checks pattern. Gentle and soothing for peaceful occasions.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Lavender",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "77",
    name: "Kota Mint Linen Saree",
    slug: "kota-mint-linen-saree",
    category: "Kota Linen",
    categorySlug: "kota-linen",
    price: 2390,
    originalPrice: 4490,
    image: "/images/products/kota-orange.jpg",
    images: [
      "/images/products/kota-orange.jpg",
      "/images/casual-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Fresh mint Kota linen saree with traditional checks pattern. Cool and refreshing for spring wear.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Mint",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "78",
    name: "Kota Cream Linen Saree",
    slug: "kota-cream-linen-saree",
    category: "Kota Linen",
    categorySlug: "kota-linen",
    price: 2190,
    originalPrice: 4090,
    image: "/images/products/kota-orange.jpg",
    images: [
      "/images/products/kota-orange.jpg",
      "/images/casual-saree.jpg",
      "/images/festive-saree.jpg"
    ],
    description: "Classic cream Kota linen saree with traditional checks pattern. Timeless elegance for any occasion.",
    details: [
      "Kota Linen Fabric",
      "Traditional Checks Pattern",
      "Lightweight Summer Wear",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Hand Wash Recommended"
    ],
    fabric: "Kota Linen",
    color: "Cream",
    isOnSale: true,
    isFeatured: true,
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
  },
  {
    id: "79",
    name: "Navy Blue Cotton Linen Saree",
    slug: "navy-blue-cotton-linen-saree",
    category: "Cotton Linen",
    categorySlug: "cotton-linen",
    price: 2099,
    originalPrice: 4199,
    image: "/images/products/cotton-white.jpg",
    images: [
      "/images/products/cotton-white.jpg",
      "/images/casual-saree.jpg",
      "/images/handloom-saree.jpg"
    ],
    description: "Classic navy blue cotton linen saree with delicate silver border. Professional and elegant for office wear.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Professional Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "Navy Blue",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "80",
    name: "Beige Cotton Linen Saree",
    slug: "beige-cotton-linen-saree",
    category: "Cotton Linen",
    categorySlug: "cotton-linen",
    price: 1899,
    originalPrice: 3799,
    image: "/images/products/cotton-white.jpg",
    images: [
      "/images/products/cotton-white.jpg",
      "/images/casual-saree.jpg",
      "/images/handloom-saree.jpg"
    ],
    description: "Neutral beige cotton linen saree with delicate silver border. Versatile and comfortable for daily wear.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Versatile Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "Beige",
    isOnSale: true,
    isFeatured: true,
    isNew: false
  },
  {
    id: "81",
    name: "Sage Green Cotton Linen Saree",
    slug: "sage-green-cotton-linen-saree",
    category: "Cotton Linen",
    categorySlug: "cotton-linen",
    price: 2199,
    originalPrice: 4399,
    image: "/images/products/cotton-white.jpg",
    images: [
      "/images/products/cotton-white.jpg",
      "/images/casual-saree.jpg",
      "/images/handloom-saree.jpg"
    ],
    description: "Soothing sage green cotton linen saree with delicate silver border. Natural and calming for peaceful occasions.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Natural Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "Sage Green",
    isOnSale: true,
    isFeatured: false,
    isNew: true
  },
  {
    id: "82",
    name: "Dusty Rose Cotton Linen Saree",
    slug: "dusty-rose-cotton-linen-saree",
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
    description: "Soft dusty rose cotton linen saree with delicate silver border. Romantic and feminine for special moments.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Romantic Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "Dusty Rose",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "83",
    name: "Charcoal Grey Cotton Linen Saree",
    slug: "charcoal-grey-cotton-linen-saree",
    category: "Cotton Linen",
    categorySlug: "cotton-linen",
    price: 2299,
    originalPrice: 4599,
    image: "/images/products/cotton-white.jpg",
    images: [
      "/images/products/cotton-white.jpg",
      "/images/casual-saree.jpg",
      "/images/handloom-saree.jpg"
    ],
    description: "Modern charcoal grey cotton linen saree with delicate silver border. Contemporary and sophisticated styling.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Contemporary Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "Charcoal Grey",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "84",
    name: "Lavender Cotton Linen Saree",
    slug: "lavender-cotton-linen-saree",
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
    description: "Gentle lavender cotton linen saree with delicate silver border. Soft and soothing for peaceful events.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Peaceful Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "Lavender",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "85",
    name: "Peach Cotton Linen Saree",
    slug: "peach-cotton-linen-saree",
    category: "Cotton Linen",
    categorySlug: "cotton-linen",
    price: 2099,
    originalPrice: 4199,
    image: "/images/products/cotton-white.jpg",
    images: [
      "/images/products/cotton-white.jpg",
      "/images/casual-saree.jpg",
      "/images/handloom-saree.jpg"
    ],
    description: "Delicate peach cotton linen saree with delicate silver border. Fresh and feminine for daytime celebrations.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Fresh Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "Peach",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "86",
    name: "Teal Cotton Linen Saree",
    slug: "teal-cotton-linen-saree",
    category: "Cotton Linen",
    categorySlug: "cotton-linen",
    price: 2199,
    originalPrice: 4399,
    image: "/images/products/cotton-white.jpg",
    images: [
      "/images/products/cotton-white.jpg",
      "/images/casual-saree.jpg",
      "/images/handloom-saree.jpg"
    ],
    description: "Beautiful teal cotton linen saree with delicate silver border. Contemporary and stylish for modern wear.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Modern Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "Teal",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "87",
    name: "Mustard Yellow Cotton Linen Saree",
    slug: "mustard-yellow-cotton-linen-saree",
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
    description: "Vibrant mustard yellow cotton linen saree with delicate silver border. Bright and cheerful for festivities.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Festive Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "Mustard Yellow",
    isOnSale: true,
    isFeatured: false,
    isNew: false
  },
  {
    id: "88",
    name: "Burgundy Cotton Linen Saree",
    slug: "burgundy-cotton-linen-saree",
    category: "Cotton Linen",
    categorySlug: "cotton-linen",
    price: 2299,
    originalPrice: 4599,
    image: "/images/products/cotton-white.jpg",
    images: [
      "/images/products/cotton-white.jpg",
      "/images/casual-saree.jpg",
      "/images/handloom-saree.jpg"
    ],
    description: "Rich burgundy cotton linen saree with delicate silver border. Deep and luxurious for formal occasions.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Luxury Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "Burgundy",
    isOnSale: true,
    isFeatured: true,
    isNew: true
  },
  {
    id: "89",
    name: "Ivory Cotton Linen Saree",
    slug: "ivory-cotton-linen-saree",
    category: "Cotton Linen",
    categorySlug: "cotton-linen",
    price: 2099,
    originalPrice: 4199,
    image: "/images/products/cotton-white.jpg",
    images: [
      "/images/products/cotton-white.jpg",
      "/images/casual-saree.jpg",
      "/images/handloom-saree.jpg"
    ],
    description: "Classic ivory cotton linen saree with delicate silver border. Timeless elegance for any celebration.",
    details: [
      "Premium Cotton Linen",
      "Silver Thread Border",
      "Timeless Design",
      "Saree Length: 5.5 meters",
      "Blouse: 0.8 meters",
      "Machine Wash Safe"
    ],
    fabric: "Cotton Linen",
    color: "Ivory",
    isOnSale: true,
    isFeatured: false,
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
  },
  {
    name: "Bridal Collection",
    slug: "bridal-collection",
    image: "/images/products/banarasi-red.jpg",
    description: "Exquisite bridal sarees for your special day"
  },
  {
    name: "Casual Wear",
    slug: "casual-wear",
    image: "/images/products/pure-linen-blue.jpg",
    description: "Comfortable and stylish sarees for everyday occasions"
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

export function searchProducts(query: string): Product[] {
  if (!query.trim()) {
    return []
  }
  
  const searchTerm = query.toLowerCase().trim()
  
  return products.filter(product => {
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
  }).sort((a, b) => {
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
    
    // Finally by featured products
    if (a.isFeatured && !b.isFeatured) return -1
    if (!a.isFeatured && b.isFeatured) return 1
    
    return 0
  })
}
